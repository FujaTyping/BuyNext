import React from 'react'

function loading() {
    return (
        <div className="flex justify-center items-center py-52">
            <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-l-3 border-blue-500"></div>
        </div>
    )
}

export default loading