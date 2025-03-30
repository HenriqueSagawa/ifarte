export function AulaSkeleton() {
    return (
        <div className="border rounded-lg p-4 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-2 w-full">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div>
                <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-3 bg-gray-200 rounded w-2/3"></div>
                    ))}
                </div>
            </div>
        </div>
    )
} 