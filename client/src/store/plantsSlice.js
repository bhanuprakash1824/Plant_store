import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';

// ── Async Thunks ─────────────────────────────────────────────────────────────

// Consumer: fetch all active plants
export const fetchAllPlants = createAsyncThunk(
  'plants/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/api/plants');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load plants');
    }
  }
);

// Producer: fetch only their plants
export const fetchMyPlants = createAsyncThunk(
  'plants/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/api/plants/mine');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load plants');
    }
  }
);

// Producer: add a plant
export const addPlant = createAsyncThunk(
  'plants/add',
  async (plantData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/api/plants', plantData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add plant');
    }
  }
);

// Producer: edit a plant
export const editPlant = createAsyncThunk(
  'plants/edit',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/api/plants/${id}`, updates);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update plant');
    }
  }
);

// Producer: delete a plant
export const deletePlant = createAsyncThunk(
  'plants/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/plants/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete plant');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const plantsSlice = createSlice({
  name: 'plants',
  initialState: {
    plants: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    // Update plant versions in state after a conflict refresh
    updatePlantVersions: (state, action) => {
      action.payload.forEach((fresh) => {
        const idx = state.plants.findIndex((p) => p._id === fresh._id);
        if (idx !== -1) state.plants[idx] = fresh;
      });
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.isLoading = true; state.error = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(fetchAllPlants.pending, pending)
      .addCase(fetchAllPlants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plants = action.payload;
      })
      .addCase(fetchAllPlants.rejected, rejected)

      .addCase(fetchMyPlants.pending, pending)
      .addCase(fetchMyPlants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plants = action.payload;
      })
      .addCase(fetchMyPlants.rejected, rejected)

      .addCase(addPlant.fulfilled, (state, action) => {
        state.plants.unshift(action.payload);
      })

      .addCase(editPlant.fulfilled, (state, action) => {
        const idx = state.plants.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.plants[idx] = action.payload;
      })

      .addCase(deletePlant.fulfilled, (state, action) => {
        state.plants = state.plants.filter((p) => p._id !== action.payload);
      });
  },
});

export const { updatePlantVersions } = plantsSlice.actions;
export default plantsSlice.reducer;
