import { Beef, Plus, Trash2, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { EmptyState, ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import TodaysDiet from '../components/diet/TodaysDiet.jsx'
import { api, getTodayKey } from '../lib/api.js'

const emptyForm = {
  name: '',
  defaultAmount: '',
  defaultUnit: '',
  calories: '',
  protein: '',
  fiber: '',
  notes: ''
}

const meals = ['Breakfast', 'Lunch', 'Mid Lunch', 'Evening Snack', 'Dinner']

function formatNumber(value) {
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 1 })
}

function formFromProtein(proteinFood) {
  if (!proteinFood) {
    return emptyForm
  }

  return {
    name: proteinFood.name,
    defaultAmount: proteinFood.defaultQuantity.amount,
    defaultUnit: proteinFood.defaultQuantity.unit,
    calories: proteinFood.nutrition.calories,
    protein: proteinFood.nutrition.protein,
    fiber: proteinFood.nutrition.fiber,
    notes: proteinFood.notes || ''
  }
}

export default function ProteinFood() {
  const [proteins, setProteins] = useState([])
  const [diet, setDiet] = useState({ entries: [], meals: {}, totals: {} })
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [selectedProtein, setSelectedProtein] = useState(null)
  const [selectedMeal, setSelectedMeal] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingProtein, setEditingProtein] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [isAdding, setAdding] = useState(false)
  const [updatingId, setUpdatingId] = useState('')
  const [error, setError] = useState('')

  async function loadPage(dateKey = selectedDate) {
    setError('')
    setLoading(true)

    try {
      const [proteinList, todayDiet] = await Promise.all([
        api.getProteins(),
        api.getTodayDiet(dateKey)
      ])
      setProteins(proteinList)
      setDiet(todayDiet)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPage(selectedDate)
  }, [selectedDate])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function openAddForm() {
    setEditingProtein(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEditForm(proteinFood) {
    setEditingProtein(proteinFood)
    setForm(formFromProtein(proteinFood))
    setShowForm(true)
  }

  async function saveProtein(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name.trim(),
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
    }

    try {
      const savedProtein = editingProtein
        ? await api.updateProtein(editingProtein._id, payload)
        : await api.createProtein(payload)

      setProteins((current) =>
        editingProtein
          ? current.map((proteinFood) =>
              proteinFood._id === savedProtein._id ? savedProtein : proteinFood
            )
          : [...current, savedProtein]
      )
      setEditingProtein(null)
      setForm(emptyForm)
      setShowForm(false)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteProtein(id) {
    setError('')

    try {
      await api.deleteProtein(id)
      setProteins((current) => current.filter((proteinFood) => proteinFood._id !== id))
      if (selectedProtein?._id === id) {
        setSelectedProtein(null)
        setSelectedMeal('')
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  async function addProteinToDiet() {
    if (!selectedProtein || !selectedMeal) {
      return
    }

    setAdding(true)
    setError('')

    try {
      const todayDiet = await api.addTodayFoods({
        dateKey: selectedDate,
        meal: selectedMeal,
        foodIds: [selectedProtein._id]
      })
      setDiet(todayDiet)
      setSelectedProtein(null)
      setSelectedMeal('')
    } catch (addError) {
      setError(addError.message)
    } finally {
      setAdding(false)
    }
  }

  async function updateQuantity(entryId, quantityAmount) {
    setUpdatingId(entryId)
    setError('')

    try {
      await api.updateDietQuantity(entryId, quantityAmount)
      setDiet(await api.getTodayDiet(selectedDate))
    } catch (quantityError) {
      setError(quantityError.message)
    } finally {
      setUpdatingId('')
    }
  }

  async function removeEntry(entryId) {
    setUpdatingId(entryId)
    setError('')

    try {
      await api.removeDietEntry(entryId)
      setDiet(await api.getTodayDiet(selectedDate))
    } catch (removeError) {
      setError(removeError.message)
    } finally {
      setUpdatingId('')
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading Protein..." />
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Protein</p>
          <h1 className="mt-2 text-3xl font-extrabold text-navy">🥩 Protein</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            My Regular Protein Foods
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Protein
        </button>
      </section>

      {error && <ErrorState message={error} />}

      {showForm && (
        <form className="dashboard-card p-5" onSubmit={saveProtein}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-navy">
              {editingProtein ? 'Edit Protein' : 'Add Protein'}
            </h2>
            <button
              type="button"
              className="text-sm font-bold text-slate-500 hover:text-navy"
              onClick={() => {
                setShowForm(false)
                setEditingProtein(null)
                setForm(emptyForm)
              }}
            >
              Cancel
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-bold text-slate-700">
              Protein Name
              <input
                required
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
              />
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
                placeholder="g, egg, serving"
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
            {isSaving ? 'Saving...' : 'Save Protein'}
          </button>
        </form>
      )}

      <section className="dashboard-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-navy">Add Protein to Today's Diet</h2>
            <label className="mt-3 flex flex-col gap-2 text-sm font-bold text-slate-700 sm:flex-row sm:items-center">
              Date:
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value)
                  setSelectedProtein(null)
                  setSelectedMeal('')
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent sm:w-auto"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,16rem)_auto]">
            <label className="space-y-2 text-sm font-bold text-slate-700">
              Which meal?
              <select
                value={selectedMeal}
                onChange={(event) => setSelectedMeal(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent"
              >
                <option value="">Select meal</option>
                {meals.map((meal) => (
                  <option key={meal} value={meal}>
                    {meal}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={!selectedProtein || !selectedMeal || isAdding}
              onClick={addProteinToDiet}
              className="self-end rounded-xl bg-accent px-5 py-3 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isAdding ? 'Adding...' : '+ Add'}
            </button>
          </div>
        </div>
        {selectedProtein && (
          <p className="mt-4 text-sm font-bold text-slate-600">
            Selected: {selectedProtein.name} for {selectedDate}
          </p>
        )}
      </section>

      {proteins.length === 0 ? (
        <EmptyState title="No protein foods yet" message="Use Add Protein to create your first protein food." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {proteins.map((proteinFood) => (
            <article key={proteinFood._id} className="dashboard-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                  <Beef className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-navy">{proteinFood.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {formatNumber(proteinFood.defaultQuantity.amount)} {proteinFood.defaultQuantity.unit}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-700">
                    {formatNumber(proteinFood.nutrition.calories)} kcal
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Protein {formatNumber(proteinFood.nutrition.protein)} g
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Fiber {formatNumber(proteinFood.nutrition.fiber)} g
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProtein(proteinFood)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => openEditForm(proteinFood)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteProtein(proteinFood._id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <TodaysDiet
        diet={diet}
        updatingId={updatingId}
        onQuantityChange={updateQuantity}
        onRemove={removeEntry}
      />
    </div>
  )
}
