import type { Metadata } from 'next';


export const metadata: Metadata = {
    title: 'Parking Lot Schedule',
    description: 'View and book parking schedules',
};

interface LayoutProps {
    children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {

    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}