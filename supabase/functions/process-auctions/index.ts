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

    console.log('Starting auction processing...');

    // Process expired auctions
    const { data: processedAuctions, error: processError } = await supabase
      .rpc('process_expired_auctions');

    if (processError) {
      console.error('Error processing expired auctions:', processError);
      throw processError;
    }

    console.log(`Processed ${processedAuctions?.length || 0} expired auctions`);

    const results = [];
    if (processedAuctions && processedAuctions.length > 0) {
      for (const auction of processedAuctions) {
        console.log(`Processed auction for product ${auction.processed_product_id}, winner: ${auction.winner_user_id}, amount: ${auction.winning_amount}`);
        results.push({
          productId: auction.processed_product_id,
          winnerId: auction.winner_user_id,
          winningAmount: auction.winning_amount
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedAuctions: results.length,
        auctions: results,
        message: 'Auction processing completed successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in auction processing function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});