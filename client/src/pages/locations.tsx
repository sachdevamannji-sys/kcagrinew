import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statesApi, citiesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import LocationModal from '@/components/modals/location-modal';

export default function LocationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [modalType, setModalType] = useState<'state' | 'city'>('state');
  const [selectedStateFilter, setSelectedStateFilter] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: states, isLoading: statesLoading } = useQuery({
    queryKey: ['/api/states'],
    queryFn: statesApi.getAll,
  });

  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ['/api/cities'],
    queryFn: () => citiesApi.getAll(),
  });

  const deleteStateMutation = useMutation({
    mutationFn: statesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/states'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
      toast({
        title: 'Success',
        description: 'State deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete state.',
        variant: 'destructive',
      });
    },
  });

  const deleteCityMutation = useMutation({
    mutationFn: citiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
      toast({
        title: 'Success',
        description: 'City deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete city.',
        variant: 'destructive',
      });
    },
  });

  const handleEditState = (state: any) => {
    setEditingLocation(state);
    setModalType('state');
    setIsModalOpen(true);
  };

  const handleEditCity = (city: any) => {
    setEditingLocation(city);
    setModalType('city');
    setIsModalOpen(true);
  };

  const handleDeleteState = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this state? This will also affect associated cities.')) {
      deleteStateMutation.mutate(id);
    }
  };

  const handleDeleteCity = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      deleteCityMutation.mutate(id);
    }
  };

  const handleAddState = () => {
    setEditingLocation(null);
    setModalType('state');
    setIsModalOpen(true);
  };

  const handleAddCity = () => {
    setEditingLocation(null);
    setModalType('city');
    setIsModalOpen(true);
  };

  // Group cities by state
  const citiesByState = cities?.reduce((acc: any, city: any) => {
    const stateId = city.stateId;
    if (!acc[stateId]) acc[stateId] = [];
    acc[stateId].push(city);
    return acc;
  }, {}) || {};

  const getStateName = (stateId: string) => {
    return states?.find((state: any) => state.id === stateId)?.name || 'Unknown State';
  };

  const filteredCities = selectedStateFilter && selectedStateFilter !== 'all'
    ? cities?.filter((city: any) => city.stateId === selectedStateFilter) || []
    : cities || [];

  if (statesLoading || citiesLoading) {
    return (
      <div>
        <Header title="Locations Management" subtitle="Manage states and cities for your operations" />
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Locations Management" subtitle="Manage states and cities for your operations" />
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">Locations</h3>
            <p className="text-sm text-muted-foreground">
              Manage states and cities for your operations
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleAddCity}
              data-testid="button-add-city"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Add City
            </Button>
            <Button 
              onClick={handleAddState}
              data-testid="button-add-state"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add State
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* States Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                States ({states?.length || 0})
              </CardTitle>
              <CardDescription>Manage states in your system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {states?.length === 0 ? (
                <div className="text-center py-8" data-testid="states-empty-state">
                  <svg className="w-8 h-8 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-sm text-muted-foreground">No states found</p>
                </div>
              ) : (
                states?.map((state: any) => (
                  <div key={state.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50" data-testid={`state-item-${state.id}`}>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-foreground">{state.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {citiesByState[state.id]?.length || 0} cities
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditState(state)}
                        data-testid={`button-edit-state-${state.id}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteState(state.id)}
                        data-testid={`button-delete-state-${state.id}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Cities Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Cities ({filteredCities?.length || 0})
                  </CardTitle>
                  <CardDescription>Manage cities in your system</CardDescription>
                </div>
                <Select value={selectedStateFilter} onValueChange={setSelectedStateFilter}>
                  <SelectTrigger className="w-40" data-testid="select-state-filter">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states?.map((state: any) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredCities?.length === 0 ? (
                <div className="text-center py-8" data-testid="cities-empty-state">
                  <svg className="w-8 h-8 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-sm text-muted-foreground">No cities found</p>
                </div>
              ) : (
                filteredCities?.map((city: any) => (
                  <div key={city.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50" data-testid={`city-item-${city.id}`}>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-secondary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <p className="font-medium text-foreground">{city.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getStateName(city.stateId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCity(city)}
                        data-testid={`button-edit-city-${city.id}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCity(city.id)}
                        data-testid={`button-delete-city-${city.id}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <LocationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingLocation(null);
          }}
          location={editingLocation}
          type={modalType}
          states={states || []}
        />
      </div>
    </div>
  );
}
