import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import FoodCard from '../components/diet/FoodCard.jsx'
import FoodForm from '../components/diet/FoodForm.jsx'
import MealSelector from '../components/diet/MealSelector.jsx'
import TodaysDiet from '../components/diet/TodaysDiet.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import { api, getTodayKey } from '../lib/api.js'

export default function DietFood() {
  const [foods, setFoods] = useState([])
  const [diet, setDiet] = useState({ entries: [], meals: {}, totals: {} })
  const [selectedFoodIds, setSelectedFoodIds] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingFood, setEditingFood] = useState(null)
  const [isSaving, setSaving] = useState(false)
  const [isAdding, setAdding] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState('')
  const [showMealSelector, setShowMealSelector] = useState(false)
  const [updatingId, setUpdatingId] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayKey())

  const addedFoodIds = useMemo(
    () => new Set((diet.entries || []).map((entry) => entry.food)),
    [diet.entries]
  )

  async function loadPage(dateKey = selectedDate) {
    setError('')
    setLoading(true)

    try {
      const [foodList, todayDiet] = await Promise.all([api.getFoods(), api.getTodayDiet(dateKey)])
      setFoods(foodList)
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

  function toggleFood(id) {
    setSelectedFoodIds((current) =>
      current.includes(id) ? current.filter((foodId) => foodId !== id) : [...current, id]
    )
  }

  function startAddFood() {
    setEditingFood(null)
    setShowForm(true)
  }

  function startEditFood(food) {
    setEditingFood(food)
    setShowForm(true)
  }

  async function saveFood(foodPayload) {
    setSaving(true)
    setError('')

    try {
      const savedFood = editingFood
        ? await api.updateFood(editingFood._id, foodPayload)
        : await api.createFood(foodPayload)

      setFoods((current) =>
        editingFood
          ? current.map((food) => (food._id === savedFood._id ? savedFood : food))
          : [...current, savedFood]
      )
      setShowForm(false)
      setEditingFood(null)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteFood(id) {
    setError('')

    try {
      await api.deleteFood(id)
      setFoods((current) => current.filter((food) => food._id !== id))
      setSelectedFoodIds((current) => current.filter((foodId) => foodId !== id))
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  function openMealSelector(foodIds = selectedFoodIds) {
    setSelectedFoodIds(foodIds)
    setShowMealSelector(true)
  }

  async function addToDiet() {
    setAdding(true)
    setError('')

    try {
      const todayDiet = await api.addTodayFoods({
        dateKey: selectedDate,
        meal: selectedMeal,
        foodIds: selectedFoodIds
      })
      setDiet(todayDiet)
      setSelectedFoodIds([])
      setShowMealSelector(false)
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
    return <LoadingState label="Loading Diet Food..." />
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Diet Food</p>
          <h1 className="mt-2 text-3xl font-extrabold text-navy">My Regular Foods</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Tick the foods eaten today, choose a meal, and add them to Today's Diet.
          </p>
        </div>
        <button
          type="button"
          onClick={startAddFood}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Food
        </button>
      </section>

      {error && <ErrorState message={error} />}

      {showForm && (
        <FoodForm
          editingFood={editingFood}
          isSaving={isSaving}
          onCancel={() => {
            setShowForm(false)
            setEditingFood(null)
          }}
          onSave={saveFood}
        />
      )}

      <section className="dashboard-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-navy">Today's Diet</h2>
            <label className="mt-3 flex flex-col gap-2 text-sm font-bold text-slate-700 sm:flex-row sm:items-center">
              Date:
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value)
                  setSelectedFoodIds([])
                  setShowMealSelector(false)
                  setSelectedMeal('')
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent sm:w-auto"
              />
            </label>
            <p className="mt-3 text-base font-extrabold text-navy">
              Selected today: {selectedFoodIds.length} foods
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={selectedFoodIds.length === 0}
              onClick={() => openMealSelector()}
              className="rounded-xl bg-accent px-5 py-3 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Add Selected Foods
            </button>
            <button
              type="button"
              onClick={() => setSelectedFoodIds([])}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-100"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </section>

      {showMealSelector && (
        <MealSelector
          selectedMeal={selectedMeal}
          onMealChange={setSelectedMeal}
          onConfirm={addToDiet}
          onCancel={() => setShowMealSelector(false)}
          isAdding={isAdding}
        />
      )}

      {foods.length === 0 ? (
        <EmptyState title="No regular foods yet" message="Use Add Food to create your first reusable food." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {foods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              checked={selectedFoodIds.includes(food._id)}
              alreadyAdded={addedFoodIds.has(food._id)}
              onToggle={toggleFood}
              onEdit={startEditFood}
              onDelete={deleteFood}
              onQuickAdd={(id) => openMealSelector([id])}
            />
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
