export function AlunoSkeleton() {
    return (
        <div className="flex justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="flex flex-col w-full">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
    )
} 