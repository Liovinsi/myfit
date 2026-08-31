import { useEffect, useState } from 'react'
import Modal from '../common/Modal.jsx'

const emptyForm = {
  name: '',
  category: 'Breakfast',
  defaultAmount: '',
  defaultUnit: '',
  calories: '',
  protein: '',
  fiber: '',
  carbs: '',
  fat: '',
  sugar: '',
  caffeine: '',
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
    carbs: food.nutrition.carbs || 0,
    fat: food.nutrition.fat || 0,
    sugar: food.nutrition.sugar || 0,
    caffeine: food.nutrition.caffeine || 0,
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
        fiber: Number(form.fiber),
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
        sugar: Number(form.sugar) || 0,
        caffeine: Number(form.caffeine) || 0
      },
      notes: form.notes.trim()
    })
  }

  const visibleCategoryOptions = categoryOptions.includes(form.category)
    ? categoryOptions
    : [form.category, ...categoryOptions]

  return (
    <Modal onClose={onCancel}>
    <form className="dashboard-card max-h-[85vh] overflow-y-auto p-5" onSubmit={handleSubmit}>
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
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Carbs (g)
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.carbs}
            onChange={(event) => updateField('carbs', event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Fat (g)
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.fat}
            onChange={(event) => updateField('fat', event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Sugar (g)
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.sugar}
            onChange={(event) => updateField('sugar', event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Caffeine (mg)
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.caffeine}
            onChange={(event) => updateField('caffeine', event.target.value)}
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

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving ? 'Saving...' : editingFood ? 'Save Changes' : 'Save Food'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
    </Modal>
  )
}
