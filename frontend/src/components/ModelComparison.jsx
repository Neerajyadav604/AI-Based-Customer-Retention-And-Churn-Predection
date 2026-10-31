import Card from './Card'

const columns = [
  ['model', 'Model'],
  ['accuracy', 'Accuracy'],
  ['precision', 'Precision'],
  ['recall', 'Recall'],
  ['f1', 'F1'],
  ['roc_auc', 'ROC-AUC'],
  ['cv_roc_auc', 'CV ROC-AUC'],
]

// Format model comparison values to three decimals.
function formatValue(value) {
  return value === undefined || value === null ? '—' : Number(value).toFixed(3)
}

// Compare the models returned by the API.
export default function ModelComparison({ models }) {
  return (
    <Card className="mt-6">
      <h2 className="text-lg font-semibold text-slate-900">Model comparison</h2>
      {models?.length ? <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>{columns.map(([key, label]) => <th key={key} className={`px-3 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 ${key !== 'model' ? 'text-right' : ''}`}>{label}</th>)}</tr>
          </thead>
          <tbody>
            {(models || []).map((model) => (
              <tr key={model.model} className={`border-b border-slate-100 ${model.model === 'Logistic Regression' ? 'bg-indigo-50' : 'bg-white'}`}>
                {columns.map(([key]) => <td key={key} className={`h-[52px] px-3 py-3 ${key !== 'model' ? 'text-right font-mono' : 'font-medium'}`}>{key === 'model' ? model[key] : formatValue(model[key])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div> : <p className="mt-4 text-sm text-slate-500">No model comparison data is available.</p>}
      <p className="mt-3 text-sm text-slate-500">All three models compared at the default 0.5 threshold. The headline numbers above use threshold 0.4.</p>
    </Card>
  )
}
