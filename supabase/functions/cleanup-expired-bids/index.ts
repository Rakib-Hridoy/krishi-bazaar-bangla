import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting cleanup of expired bids...');

    // Get all accepted bids that have passed their confirmation deadline
    const { data: expiredBids, error: fetchError } = await supabase
      .from('bids')
      .select('id, product_id, buyer_id, confirmation_deadline')
      .eq('status', 'accepted')
      .lt('confirmation_deadline', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired bids:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredBids?.length || 0} expired bids`);

    if (expiredBids && expiredBids.length > 0) {
      // Update all expired bids to abandoned status
      const { error: updateError } = await supabase
        .from('bids')
        .update({ 
          status: 'abandoned',
          abandoned_at: new Date().toISOString()
        })
        .in('id', expiredBids.map(bid => bid.id));

      if (updateError) {
        console.error('Error updating expired bids:', updateError);
        throw updateError;
      }

      // Send notifications to buyers about abandoned bids
      for (const bid of expiredBids) {
        try {
          // Get product title for notification
          const { data: product } = await supabase
            .from('products')
            .select('title')
            .eq('id', bid.product_id)
            .single();

          // Create notification for the buyer
          await supabase
            .from('notifications')
            .insert({
              user_id: bid.buyer_id,
              type: 'bid',
              title: 'আপনার বিড সময়সীমা শেষ',
              message: `"${product?.title || 'পণ্য'}" এর জন্য আপনার বিড সময়সীমা শেষ হয়ে গেছে এবং এটি বাতিল করা হয়েছে।`,
              metadata: {
                bid_id: bid.id,
                product_id: bid.product_id,
                action: 'bid_expired'
              }
            });

          console.log(`Notification sent to buyer ${bid.buyer_id} for expired bid ${bid.id}`);
        } catch (notificationError) {
          console.error(`Error sending notification for bid ${bid.id}:`, notificationError);
          // Continue with other notifications even if one fails
        }
      }

      console.log(`Successfully abandoned ${expiredBids.length} expired bids`);
    }

    // Also check for users who need suspension due to multiple abandonments
    const { data: problematicUsers, error: userFetchError } = await supabase
      .from('profiles')
      .select('id, bid_abandonment_count')
      .gte('bid_abandonment_count', 3)
      .is('bid_suspension_until', null);

    if (userFetchError) {
      console.error('Error fetching problematic users:', userFetchError);
    } else if (problematicUsers && problematicUsers.length > 0) {
      // Suspend users with 3 or more abandonments
      const { error: suspensionError } = await supabase
        .from('profiles')
        .update({ 
          bid_suspension_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })
        .in('id', problematicUsers.map(user => user.id));

      if (suspensionError) {
        console.error('Error suspending users:', suspensionError);
      } else {
        console.log(`Suspended ${problematicUsers.length} users for multiple abandonments`);
        
        // Send suspension notifications
        for (const user of problematicUsers) {
          try {
            await supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: 'system',
                title: 'বিডিং থেকে সাময়িক বন্ধ',
                message: 'একাধিকবার বিড পরিত্যাগ করার কারণে আপনি ৭ দিনের জন্য বিডিং থেকে বন্ধ করা হয়েছে।',
                metadata: {
                  action: 'user_suspended',
                  reason: 'multiple_bid_abandonments',
                  abandonment_count: user.bid_abandonment_count
                }
              });
          } catch (notificationError) {
            console.error(`Error sending suspension notification to user ${user.id}:`, notificationError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        abandonedBids: expiredBids?.length || 0,
        suspendedUsers: problematicUsers?.length || 0,
        message: 'Cleanup completed successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in cleanup function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});