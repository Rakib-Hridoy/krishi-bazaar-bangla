
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarProps {
  user: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  className?: string;
}

const UserAvatar = ({ user, className = "w-10 h-10" }: UserAvatarProps) => {
  return (
    <Avatar className={className}>
      {user.avatar ? (
        <AvatarImage src={user.avatar} alt={user.name || "User"} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-agriculture-green-light text-white">
        {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
