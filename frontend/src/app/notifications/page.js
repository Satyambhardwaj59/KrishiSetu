'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, deleteNotification, markAllAsRead } from '@/store/slices/notificationSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Bell, Package, IndianRupee, MessageSquare, CheckCircle, Trash2, CloudSun, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { items, loading, unreadCount } = useSelector(state => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 50 }));
  }, [dispatch]);

  const getIcon = (type) => {
    if (type.includes('order'))          return <Package      size={20} className="text-blue-400" />;
    if (type.includes('payment'))        return <IndianRupee  size={20} className="text-green-400" />;
    if (type.includes('message'))        return <MessageSquare size={20} className="text-amber-400" />;
    if (type === 'weather_alert')        return <CloudSun     size={20} className="text-sky-400" />;
    if (type === 'crop_advisory')        return <Leaf         size={20} className="text-emerald-400" />;
    return <Bell size={20} className="text-slate-400" />;
  };

  const getLink = (notif) => {
    if (notif.type.includes('order'))    return `/orders/${notif.data?.orderId}`;
    if (notif.type.includes('payment'))  return `/orders/${notif.data?.orderId}`;
    if (notif.type.includes('message'))  return `/chat?user=${notif.data?.senderId}`;
    if (notif.type === 'weather_alert')  return '/weather';
    if (notif.type === 'crop_advisory')  return '/weather';
    return '#';
  };

  return (
    <div className="min-h-screen pt-24 px-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
         <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-slate-400 mt-1">You have {unreadCount} unread messages</p>
         </div>
         {unreadCount > 0 && (
           <Button variant="outline" size="sm" onClick={() => dispatch(markAllAsRead())}>
             Mark all as read
           </Button>
         )}
      </div>

      <Card padding={false} className="overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="p-8 flex justify-center"><div className="animate-spin text-green-500 rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div></div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {items.map((notif) => (
              <div 
                key={notif._id} 
                className={`p-5 flex items-start gap-4 transition-colors ${!notif.isRead ? 'bg-slate-800/80' : 'hover:bg-slate-800/30'}`}
              >
                <div className={`p-3 rounded-xl shrink-0 mt-1 ${!notif.isRead ? 'bg-slate-700 shadow-inner' : 'bg-slate-800/50'}`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <Link href={getLink(notif)} onClick={() => !notif.isRead && dispatch(markAsRead(notif._id))}>
                      <h3 className={`text-base font-semibold hover:text-green-400 transition-colors ${!notif.isRead ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </h3>
                    </Link>
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm ${!notif.isRead ? 'text-slate-300' : 'text-slate-400'}`}>
                    {notif.body}
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {!notif.isRead && (
                    <button 
                      onClick={() => dispatch(markAsRead(notif._id))}
                      className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => dispatch(deleteNotification(notif._id))}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
