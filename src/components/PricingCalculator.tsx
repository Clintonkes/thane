"use client";

import { useState } from "react";
import { Calculator, Truck, MapPin, Weight } from "lucide-react";

export function PricingCalculator() {
  const [distance, setDistance] = useState(100);
  const [weight, setWeight] = useState(5000);
  const [truckType, setTruckType] = useState("semi");
  const [express, setExpress] = useState(false);

  const truckTypes = [
    { id: "semi", name: "Semi-Trailer", rate: 2.5, minWeight: 10000 },
    { id: "box", name: "Box Truck", rate: 2.0, minWeight: 5000 },
    { id: "flatbed", name: "Flatbed", rate: 2.2, minWeight: 8000 },
    { id: "refrigerated", name: "Refrigerated", rate: 3.0, minWeight: 5000 },
  ];

  const selectedTruck = truckTypes.find((t) => t.id === truckType);

  const basePrice = distance * (selectedTruck?.rate || 2.5);
  const weightSurcharge = weight > (selectedTruck?.minWeight || 10000) 
    ? (weight - (selectedTruck?.minWeight || 10000)) * 0.05 
    : 0;
  const expressFee = express ? basePrice * 0.3 : 0;
  const totalPrice = basePrice + weightSurcharge + expressFee;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="section-title flex items-center justify-center gap-3">
            <Calculator className="h-8 w-8 text-accent" />
            Shipping Cost Calculator
          </h2>
          <p className="section-subtitle mx-auto">
            Get an instant estimate for your shipment
          </p>
        </div>

        <div className="max-w-4xl mx-auto animate-slide-up">
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                {/* Truck Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="h-4 w-4 inline mr-2" />
                    Truck Type
                  </label>
                  <select
                    value={truckType}
                    onChange={(e) => setTruckType(e.target.value)}
                    className="input-field"
                  >
                    {truckTypes.map((truck) => (
                      <option key={truck.id} value={truck.id}>
                        {truck.name} - ${truck.rate}/mile
                      </option>
                    ))}
                  </select>
                </div>

                {/* Distance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Distance (miles)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>50</span>
                    <span className="font-semibold text-primary">{distance} miles</span>
                    <span>1000</span>
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Weight className="h-4 w-4 inline mr-2" />
                    Cargo Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="input-field"
                    min="100"
                    max="100000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Min: {selectedTruck?.minWeight || 10000} lbs for selected truck
                  </p>
                </div>

                {/* Express Delivery */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <div className="font-medium text-gray-800">Express Delivery</div>
                    <div className="text-sm text-gray-500">30% surcharge for priority service</div>
                  </div>
                  <button
                    onClick={() => setExpress(!express)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      express ? "bg-accent" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        express ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="bg-primary rounded-xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-6">Estimated Cost</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Base Fare</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>
                  {weightSurcharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Weight Surcharge</span>
                      <span>${weightSurcharge.toFixed(2)}</span>
                    </div>
                  )}
                  {expressFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Express Fee</span>
                      <span>${expressFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-accent">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-300 mb-4">
                  * This is an estimate. Final price may vary based on specific requirements.
                </p>

                <a
                  href="/booking"
                  className="block w-full bg-accent hover:bg-accent-dark text-center text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Book Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
