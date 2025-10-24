const TemplateList = ({ templates }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {templates.map((template) => (
        <div key={template.id} className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold">{template.name}</h3>
          <p className="text-sm text-gray-600 mt-2">{template.category}</p>
          <span className={`mt-2 inline-block px-2 py-1 text-xs rounded ${
            template.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
            template.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {template.status}
          </span>
        </div>
      ))}
    </div>
  )
}

export default TemplateList
