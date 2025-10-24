/* 
 * COPY TO: ~/whatsapp-platform/frontend/src/components/chatbot/RuleBuilder.jsx
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useChatbotStore from '../../store/chatbotStore';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

const RuleBuilder = () => {
  const { id } = useParams();
  const { 
    rules, 
    loading, 
    fetchRules, 
    addRule, 
    updateRule, 
    deleteRule,
    bulkImportRules 
  } = useChatbotStore();

  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    trigger: '',
    response: '',
    type: 'contains',
    priority: 0
  });
  const [importText, setImportText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRules();
  }, [id]);

  const loadRules = async () => {
    try {
      await fetchRules(id);
    } catch (err) {
      console.error('Failed to load rules:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await updateRule(id, editingRule.id, formData);
      } else {
        await addRule(id, formData);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save rule:', err);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      trigger: rule.trigger,
      response: rule.response,
      type: rule.type,
      priority: rule.priority
    });
    setShowModal(true);
  };

  const handleDelete = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await deleteRule(id, ruleId);
      } catch (err) {
        console.error('Failed to delete rule:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      trigger: '',
      response: '',
      type: 'contains',
      priority: 0
    });
    setEditingRule(null);
    setShowModal(false);
  };

  const handleBulkImport = async () => {
    try {
      // Parse CSV format: trigger,response,type,priority
      const lines = importText.trim().split('\n');
      const rules = lines
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(',').map(p => p.trim());
          return {
            trigger: parts[0],
            response: parts[1],
            type: parts[2] || 'contains',
            priority: parseInt(parts[3] || '0')
          };
        });

      await bulkImportRules(id, rules);
      setImportText('');
      setShowImportModal(false);
    } catch (err) {
      console.error('Failed to import rules:', err);
      alert('Failed to import rules. Please check the format.');
    }
  };

  const filteredRules = rules.filter(rule =>
    rule.trigger.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.response.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRules = [...filteredRules].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rule Builder</h2>
          <p className="text-gray-600 mt-1">
            Define keyword triggers and automated responses
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2"
          >
            <DocumentArrowUpIcon className="w-5 h-5" />
            Import CSV
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search rules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="large" />
        </div>
      ) : sortedRules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No rules yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first rule to start automating responses
          </p>
          <Button onClick={() => setShowModal(true)}>
            Create First Rule
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {rule.priority || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {rule.trigger}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {rule.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {rule.response}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Rule Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingRule ? 'Edit Rule' : 'Add New Rule'}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Keyword/Phrase *
            </label>
            <Input
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              placeholder="e.g., hello, pricing, support"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Match Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="exact">Exact Match</option>
              <option value="contains">Contains</option>
              <option value="starts-with">Starts With</option>
              <option value="ends-with">Ends With</option>
              <option value="regex">Regex</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              How to match the trigger against incoming messages
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response *
            </label>
            <textarea
              value={formData.response}
              onChange={(e) => setFormData({ ...formData, response: e.target.value })}
              rows={4}
              placeholder="Bot's response when this rule is triggered..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <Input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              min="0"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher priority rules are matched first (0-100)
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingRule ? 'Update Rule' : 'Add Rule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportText('');
        }}
        title="Import Rules from CSV"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV Data
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={10}
              placeholder="trigger,response,type,priority
hello,Hello! How can I help you?,contains,10
pricing,Our plans start at $99/month,contains,8
support,Contact us at support@example.com,contains,5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: trigger,response,type,priority (one rule per line)
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowImportModal(false);
                setImportText('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkImport} disabled={!importText.trim()}>
              Import Rules
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RuleBuilder;
