import { useEffect, useState } from 'react'
import Modal from '../common/Modal.jsx'

const CATEGORIES = ['Food', 'Drink', 'Workout', 'Water', 'Other']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Other']

const emptyForm = {
  category: 'Food',
  name: '',
  quantity: '',
  mealType: 'Snack',
  calories: '',
  protein: '',
  duration: '',
  caloriesBurned: '',
  waterMl: ''
}

function formFromItem(item) {
  if (!item) {
    return emptyForm
  }

  return {
    category: item.category,
    name: item.name || '',
    quantity: item.quantity || '',
    mealType: item.mealType || 'Snack',
    calories: item.calories ?? '',
    protein: item.protein ?? '',
    duration: item.duration || '',
    caloriesBurned: item.caloriesBurned ?? '',
    waterMl: item.waterMl ?? ''
  }
}

export default function ExtraItemForm({ editingItem, onCancel, onSave, isSaving }) {
  const [form, setForm] = useState(formFromItem(editingItem))
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(formFromItem(editingItem))
    setError('')
  }, [editingItem])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const isFoodOrDrink = form.category === 'Food' || form.category === 'Drink'

    if (isFoodOrDrink && !form.name.trim()) {
      setError('Name is required')
      return
    }

    if (form.category === 'Workout' && !form.name.trim()) {
      setError('Activity is required')
      return
    }

    if (form.category === 'Other' && !form.name.trim()) {
      setError('Description is required')
      return
    }

    if (form.category === 'Water' && !(Number(form.waterMl) > 0)) {
      setError('Enter an amount in ml greater than zero')
      return
    }

    const payload = { category: form.category }

    if (isFoodOrDrink) {
      payload.name = form.name.trim()
      payload.quantity = form.quantity.trim()
      payload.mealType = form.mealType
      if (form.calories !== '') payload.calories = Number(form.calories)
      if (form.protein !== '') payload.protein = Number(form.protein)
    } else if (form.category === 'Workout') {
      payload.name = form.name.trim()
      payload.duration = form.duration.trim()
      if (form.caloriesBurned !== '') payload.caloriesBurned = Number(form.caloriesBurned)
    } else if (form.category === 'Water') {
      payload.waterMl = Number(form.waterMl)
    } else {
      payload.name = form.name.trim()
    }

    onSave(payload)
  }

  const isFoodOrDrink = form.category === 'Food' || form.category === 'Drink'

  return (
    <Modal onClose={onCancel}>
      <form className="dashboard-card max-h-[85vh] overflow-y-auto p-5" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-navy">{editingItem ? 'Edit Extra' : 'Add Extra'}</h2>
          <button type="button" className="text-sm font-bold text-slate-500 hover:text-navy" onClick={onCancel}>
            Cancel
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="space-y-2 text-sm font-bold text-slate-700">
            Category
            <select
              disabled={Boolean(editingItem)}
              value={form.category}
              onChange={(event) => setForm({ ...emptyForm, category: event.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent disabled:bg-slate-100"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          {isFoodOrDrink && (
            <>
              <label className="space-y-2 text-sm font-bold text-slate-700">
                Name
                <input
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="e.g. Apple"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-bold text-slate-700">
                  Quantity
                  <input
                    value={form.quantity}
                    onChange={(event) => updateField('quantity', event.target.value)}
                    placeholder="e.g. 1"
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent"
                  />
                </label>
                <label className="space-y-2 text-sm font-bold text-slate-700">
                  Meal
                  <select
                    value={form.mealType}
                    onChange={(event) => updateField('mealType', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent"
                  >
                    {MEAL_TYPES.map((meal) => (
                      <option key={meal} value={meal}>
                        {meal}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-bold text-slate-700">
                  Calories (optional)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.calories}
                    onChange={(event) => updateField('calories', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent"
                  />
                </label>
                <label className="space-y-2 text-sm font-bold text-slate-700">
                  Protein grams (optional)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.protein}
                    onChange={(event) => updateField('protein', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent"
                  />
                </label>
              </div>
            </>
          )}

          {form.category === 'Workout' && (
            <>
              <label className="space-y-2 text-sm font-bold text-slate-700">
                Activity
                <input
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="e.g. Extra Walking"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-bold text-slate-700">
                  Duration
                  <input
                    value={form.duration}
                    onChange={(event) => updateField('duration', event.target.value)}
                    placeholder="e.g. 20 minutes"
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent"
                  />
                </label>
                <label className="space-y-2 text-sm font-bold text-slate-700">
                  Calories burned (optional)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.caloriesBurned}
                    onChange={(event) => updateField('caloriesBurned', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent"
                  />
                </label>
              </div>
            </>
          )}

          {form.category === 'Water' && (
            <label className="space-y-2 text-sm font-bold text-slate-700">
              Amount (ml)
              <input
                type="number"
                min="1"
                step="50"
                value={form.waterMl}
                onChange={(event) => updateField('waterMl', event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent"
              />
            </label>
          )}

          {form.category === 'Other' && (
            <label className="space-y-2 text-sm font-bold text-slate-700">
              Description
              <textarea
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent"
              />
            </label>
          )}
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Extra'}
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
