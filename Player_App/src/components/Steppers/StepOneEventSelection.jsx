import toast from "react-hot-toast";

// 2. StepOneEventSelection Component
const StepOneEventSelection = ({ categories, selectedEvents, setSelectedEvents, entryFees, onNext }) => {
  const SINGLES_DOUBLES_LIMIT = 3;
  const MIXED_DOUBLES_LIMIT = 1;
  const TOTAL_EVENTS_LIMIT = 4;

  const singlesDoublesCount = selectedEvents.filter(e => e.type !== 'Mixed Doubles').length;
  const mixedDoublesCount = selectedEvents.filter(e => e.type === 'Mixed Doubles').length;
  const totalCount = selectedEvents.length;

  const totalFee = selectedEvents.reduce((acc, event) => {
    const feeKey = event.type === 'Singles' ? 'singles' : 'doubles';
    return acc + entryFees[feeKey];
  }, 0);

  const isEventSelected = (categoryName, type) => 
    selectedEvents.some(e => e.category === categoryName && e.type === type);

  const canSelectEvent = (type) => {
    if (totalCount >= TOTAL_EVENTS_LIMIT) return false;

    if (type === 'Mixed Doubles') {
      return mixedDoublesCount < MIXED_DOUBLES_LIMIT;
    } else { // Singles or Doubles
      return singlesDoublesCount < SINGLES_DOUBLES_LIMIT;
    }
  };

  const handleToggleEvent = (categoryName, type) => {
    const newEvent = { category: categoryName, type: type };
    const isCurrentlySelected = isEventSelected(categoryName, type);

    if (isCurrentlySelected) {
      setSelectedEvents(prev => prev.filter(e => !(e.category === categoryName && e.type === type)));
    } else {
      if (canSelectEvent(type)) {
        setSelectedEvents(prev => [...prev, newEvent]);
      } else {
        let message = `Cannot select more than ${TOTAL_EVENTS_LIMIT} total events.`;
        if (type === 'Mixed Doubles' && mixedDoublesCount >= MIXED_DOUBLES_LIMIT) {
          message = `Maximum ${MIXED_DOUBLES_LIMIT} Mixed Doubles event allowed.`;
        } else if (singlesDoublesCount >= SINGLES_DOUBLES_LIMIT) {
          message = `Maximum ${SINGLES_DOUBLES_LIMIT} Singles/Doubles events allowed.`;
        }
        toast.error(message);
      }
    }
  };

  const RuleTag = ({ label, count, limit }) => (
    <div className={`px-3 py-1 text-sm rounded-full font-medium ${count > limit ? 'bg-red-600 text-white' : 'bg-cyan-600 text-white'}`}>
      {label}: {count}/{limit}
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4 p-4 bg-[#0d162a] rounded-xl border border-cyan-400/20">
        <RuleTag label="Total Events" count={totalCount} limit={TOTAL_EVENTS_LIMIT} />
        <RuleTag label="Singles/Doubles" count={singlesDoublesCount} limit={SINGLES_DOUBLES_LIMIT} />
        <RuleTag label="Mixed Doubles" count={mixedDoublesCount} limit={MIXED_DOUBLES_LIMIT} />
        <div className="text-xl font-bold text-yellow-300">Total Price: ₹{totalFee}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.name}
            className="bg-[#0f1d38] p-5 rounded-xl border border-gray-700 shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-300"
          >
            <h3 className="text-lg font-bold text-cyan-300 mb-1">{category.name.replace('Boys & Girls', '').trim()}</h3>
            <p className="text-sm text-gray-400 mb-4">After Born: {category.afterBorn}</p>
            
            <div className="flex flex-col gap-2">
              {category.events.map((type) => {
                const isSelected = isEventSelected(category.name, type);
                const canBeSelected = canSelectEvent(type) || isSelected; // Can click if already selected

                return (
                  <button
                    key={type}
                    onClick={() => handleToggleEvent(category.name, type)}
                    disabled={!canBeSelected && !isSelected}
                    className={`
                      w-full py-2 rounded-lg font-semibold transition-all duration-200
                      ${isSelected
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/50 transform scale-[1.02]'
                        : canBeSelected
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                      }
                    `}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end w-full mt-8">
        <button
          disabled={selectedEvents.length === 0}
          onClick={onNext}
          className={`px-8 py-2 font-semibold rounded-lg transition-all duration-200 shadow-md ${
            selectedEvents.length === 0
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 to-cyan-400 hover:scale-105"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default StepOneEventSelection;