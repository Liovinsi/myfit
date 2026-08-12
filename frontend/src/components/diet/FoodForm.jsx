import { useEffect, useState } from 'react'

const emptyForm = {
  name: '',
  category: 'Breakfast',
  defaultAmount: '',
  defaultUnit: '',
  calories: '',
  protein: '',
  fiber: '',
  notes: ''
}

const categoryOptions = [
  'Breakfast',
  'Lunch',
  'Snack',
  'Dinner',
  'Meal',
  'Protein',
  'Drink',
  'Other'
]

function formFromFood(food) {
  if (!food) {
    return emptyForm
  }

  return {
    name: food.name,
    category: food.category || 'Other',
    defaultAmount: food.defaultQuantity.amount,
    defaultUnit: food.defaultQuantity.unit,
    calories: food.nutrition.calories,
    protein: food.nutrition.protein,
    fiber: food.nutrition.fiber,
    notes: food.notes || ''
  }
}

export default function FoodForm({ editingFood, onCancel, onSave, isSaving }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    setForm(formFromFood(editingFood))
  }, [editingFood])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    onSave({
      name: form.name.trim(),
      category: form.category,
      defaultQuantity: {
        amount: Number(form.defaultAmount),
        unit: form.defaultUnit.trim()
      },
      nutrition: {
        calories: Number(form.calories),
        protein: Number(form.protein),
        fiber: Number(form.fiber)
      },
      notes: form.notes.trim()
    })
  }

  const visibleCategoryOptions = categoryOptions.includes(form.category)
    ? categoryOptions
    : [form.category, ...categoryOptions]

  return (
    <form className="dashboard-card p-5" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-navy">{editingFood ? 'Edit Food' : 'Add Food'}</h2>
        <button type="button" className="text-sm font-bold text-slate-500 hover:text-navy" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Food Name
          <input
            required
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Category
          <select
            required
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          >
            {visibleCategoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Default Quantity
          <input
            required
            type="number"
            step="0.1"
            min="0.1"
            value={form.defaultAmount}
            onChange={(event) => updateField('defaultAmount', event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Quantity Unit
          <input
            required
            placeholder="g, cup, medium"
            value={form.defaultUnit}
            onChange={(event) => updateField('defaultUnit', event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Calories
          <input
            required
            type="number"
            step="0.1"
            min="0"
            value={form.calories}
            onChange={(event) => updateField('calories', event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Protein
          <input
            required
            type="number"
            step="0.1"
            min="0"
            value={form.protein}
            onChange={(event) => updateField('protein', event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Fiber
          <input
            required
            type="number"
            step="0.1"
            min="0"
            value={form.fiber}
            onChange={(event) => updateField('fiber', event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-700 md:col-span-2">
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-5 rounded-xl bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSaving ? 'Saving...' : 'Save Food'}
      </button>
    </form>
  )
}
