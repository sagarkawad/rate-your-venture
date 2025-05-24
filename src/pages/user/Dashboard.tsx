import React, { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import { api } from '../../services/api';
import UserLayout from '../../components/layout/UserLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import StarRating from '../../components/common/StarRating';

interface Store {
  id: number;
  name: string;
  address: string;
  overallRating: number;
  userRating: number | null;
}

const NormalUserDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingStore, setRatingStore] = useState<Store | null>(null);
  const [ratingValue, setRatingValue] = useState(0);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ stores: Store[] }>('/user/stores');
        setStores(response.data.stores);
        setFilteredStores(response.data.stores);
      } catch (err: any) {
        setError('Failed to load stores. Please try again later.');
        console.error('Error fetching stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(lowercasedSearch) ||
          store.address.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores);
    }
  }, [searchTerm, stores]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openRatingModal = (store: Store) => {
    setRatingStore(store);
    setRatingValue(store.userRating || 0);
  };

  const closeRatingModal = () => {
    setRatingStore(null);
    setRatingValue(0);
  };

  const submitRating = async () => {
    if (!ratingStore) return;
    
    try {
      await api.post('/user/ratings', {
        storeId: ratingStore.id,
        rating: ratingValue,
      });
      
      // Update the store in the list with the new rating
      const updatedStores = stores.map(store => {
        if (store.id === ratingStore.id) {
          return {
            ...store,
            userRating: ratingValue,
            // This is a simplified calculation - in a real app, the backend would return the updated overall rating
            overallRating: store.userRating ? 
              (store.overallRating * 0.9 + ratingValue * 0.1) : 
              store.overallRating,
          };
        }
        return store;
      });
      
      setStores(updatedStores);
      setFilteredStores(
        searchTerm ? 
          updatedStores.filter(store => 
            store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address.toLowerCase().includes(searchTerm.toLowerCase())
          ) : 
          updatedStores
      );
      
      closeRatingModal();
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      // Show error message
    }
  };

  return (
    <UserLayout title="Stores">
      <div className="space-y-6 animate-fade-in">
        <div className="w-full md:w-64">
          <Input
            placeholder="Search stores..."
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<Search size={20} className="text-gray-400" />}
            fullWidth
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-error-50 text-error-700 p-4 rounded-md">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => (
                <Card key={store.id} hover className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{store.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{store.address}</p>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Overall Rating</p>
                      <StarRating value={store.overallRating} readOnly />
                    </div>
                    
                    {store.userRating ? (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Your Rating</p>
                        <StarRating value={store.userRating} readOnly />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic mb-4">You haven't rated this store yet</p>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => openRatingModal(store)}
                    variant={store.userRating ? 'outline' : 'primary'}
                    fullWidth
                    leftIcon={<Star size={16} />}
                  >
                    {store.userRating ? 'Update Rating' : 'Rate This Store'}
                  </Button>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No stores found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {ratingStore.userRating ? 'Update' : 'Submit'} Rating
                </h2>
                <button
                  onClick={closeRatingModal}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{ratingStore.name}</h3>
                <p className="text-gray-600 text-sm">{ratingStore.address}</p>
              </div>
              
              <div className="mb-8 flex flex-col items-center">
                <p className="text-sm font-medium text-gray-700 mb-2">Select your rating:</p>
                <StarRating 
                  value={ratingValue} 
                  onChange={setRatingValue}
                  size="lg"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeRatingModal}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={submitRating}
                  disabled={ratingValue === 0}
                >
                  Submit Rating
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default NormalUserDashboard;