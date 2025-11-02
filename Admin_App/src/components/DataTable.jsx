import React from 'react'

const DataTable = ({}) => {
  return (
    <div className="relative overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
        {selectedRows.length > 0 && renderBulkActions()}
        <table className="min-w-full divide-y divide-gray-200 relative">
          
          {/* Table Header */}
          <thead className="bg-gray-50 sticky top-0 z-0">
            <tr>
              <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </th>
              {columns.filter(c => c.accessor !== 'select').map(col => (
                <th
                  key={col.accessor}
                  scope="col"
                  // Apply responsive classes to headers
                  className={`p-4 text-left text-xs font-medium text-gray-500 tracking-wider 
                             ${col.responsive === 'md-up' ? 'hidden md:table-cell' : ''}
                             ${col.responsive === 'sm-up' ? 'hidden sm:table-cell' : ''}
                             ${col.responsive === 'lg-up' ? 'hidden lg:table-cell' : ''}
                             ${col.responsive === 'always' ? 'table-cell' : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTableData.length === 0 ? (
                <tr>
                    <td colSpan={columns.length} className="py-10 text-center text-gray-500">
                        No entries found matching your criteria.
                    </td>
                </tr>
            ) : (
                currentTableData.map(item => (
                <React.Fragment key={item.id}>
                  {/* Main Data Row */}
                  <tr className={`hover:bg-indigo-50 transition ${selectedRows.includes(item.id) ? 'bg-indigo-100' : ''}`}>
                    {columns.map(col => (
                      <td 
                        key={col.accessor} 
                        // Apply responsive classes to cells
                        className={`p-4 whitespace-nowrap text-sm text-gray-500 
                                     ${col.responsive === 'md-up' ? 'hidden md:table-cell' : ''}
                                     ${col.responsive === 'sm-up' ? 'hidden sm:table-cell' : ''}
                                     ${col.responsive === 'lg-up' ? 'hidden lg:table-cell' : ''}
                                     ${col.responsive === 'always' ? 'table-cell' : ''}`}
                      >
                        {col.cell ? col.cell(item) : item[col.accessor]}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Expanded Detail Row */}
                  {expandedRows[item.id] && (
                    <tr className="bg-gray-50">
                      <td colSpan={columns.length} className="p-4 border-t border-indigo-200">
                        <div className="space-y-4">
                          <h3 className="font-bold text-lg text-indigo-800 border-b pb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Detailed Event Submissions ({item.detailedEvents.length})
                          </h3>
                          {item.detailedEvents.map((event, index) => (
                            <DetailCard key={event._id} event={event} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
  )
}

export default DataTable