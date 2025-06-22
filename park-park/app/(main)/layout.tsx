export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (


            <div className="flex flex-col flex-1">
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 min-h-16">

                </header>

                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>


    );
}