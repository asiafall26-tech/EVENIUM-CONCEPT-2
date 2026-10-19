import { create } from 'zustand';  
export type NotificationType = 'info' | 'success' | 'warning' | 'error';  
export interface AppNotification { id: string; title: string; message: string; type: NotificationType; href?: string; }  
interface NotificationStore { notifications: AppNotification[]; addNotification: (n: Omit<AppNotification, 'id'>) => void; removeNotification: (id: string) => void; }  
export const useNotificationStore = create<NotificationStore>((set) => ({ notifications: [], addNotification: (n) => { const id = Math.random().toString(36).substring(2, 9); set((state) => ({ notifications: [...state.notifications, { ...n, id }] })); setTimeout(() => { set((state) => ({ notifications: state.notifications.filter(x => x.id !== id) })); }, 5000); }, removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })) })); 
