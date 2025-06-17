
import type { NextPage } from 'next';
import BottomNavbar from '@/components/BottomNavbar';

const ProfilePage: NextPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center p-4 pb-20"> {/* pb-20 for navbar space */}
        <h1 className="text-4xl font-bold mb-8">Profile</h1>
        <p className="text-lg text-muted-foreground">
          User profile information will be here.
        </p>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default ProfilePage;
