import { InstagramInbox } from '@/components/instagram/InstagramInbox';

export const metadata = {
  title: 'Instagram Inbox | Boop',
  description: 'Gerencie suas mensagens do Instagram',
};

export default function InstagramInboxPage() {
  return (
    <main className="flex-1 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="h-full relative">
            <InstagramInbox />
          </div>
        </div>
      </div>
    </main>
  );
} 