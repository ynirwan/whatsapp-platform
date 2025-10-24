const TemplatePreview = ({ template }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Preview</h3>
      <div className="bg-white rounded-lg p-4 border">
        <p>{template?.name || 'Template preview'}</p>
      </div>
    </div>
  )
}

export default TemplatePreview
