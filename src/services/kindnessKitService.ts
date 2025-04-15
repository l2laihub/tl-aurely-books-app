import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface KindnessKit {
  id: string;
  title: string;
  headline?: string;
  subheadline?: string;
  book_id: string;
  hero_image_url?: string;
  mailerlite_group_id?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface KitFile {
  id: string;
  kit_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  sort_order: number;
  created_at?: string;
}

export interface KitSubscriber {
  id: string;
  kit_id: string;
  email: string;
  name?: string;
  created_at?: string;
}

// Kindness Kit CRUD operations
export const getAllKindnessKits = async (): Promise<KindnessKit[]> => {
  const { data, error } = await supabase
    .from('kindness_kits')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching kindness kits:', error);
    throw error;
  }
  
  return data || [];
};

export const getKindnessKitById = async (id: string): Promise<KindnessKit | null> => {
  const { data, error } = await supabase
    .from('kindness_kits')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching kindness kit:', error);
    throw error;
  }
  
  return data;
};

export const getKindnessKitByBookId = async (bookId: string): Promise<KindnessKit | null> => {
  const { data, error } = await supabase
    .from('kindness_kits')
    .select('*')
    .eq('book_id', bookId)
    .eq('active', true)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
    console.error('Error fetching kindness kit by book ID:', error);
    throw error;
  }
  
  return data || null;
};

export const createKindnessKit = async (kit: Omit<KindnessKit, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const newKit = {
    ...kit,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('kindness_kits')
    .insert(newKit)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating kindness kit:', error);
    throw error;
  }
  
  return data.id;
};

export const updateKindnessKit = async (id: string, kit: Partial<KindnessKit>): Promise<void> => {
  const { error } = await supabase
    .from('kindness_kits')
    .update({
      ...kit,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating kindness kit:', error);
    throw error;
  }
};

export const deleteKindnessKit = async (id: string): Promise<void> => {
  // First delete all files associated with this kit
  const { error: filesError } = await supabase
    .from('kit_files')
    .delete()
    .eq('kit_id', id);
  
  if (filesError) {
    console.error('Error deleting kit files:', filesError);
    throw filesError;
  }
  
  // Then delete all subscribers associated with this kit
  const { error: subscribersError } = await supabase
    .from('kit_subscribers')
    .delete()
    .eq('kit_id', id);
  
  if (subscribersError) {
    console.error('Error deleting kit subscribers:', subscribersError);
    throw subscribersError;
  }
  
  // Finally delete the kit itself
  const { error } = await supabase
    .from('kindness_kits')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting kindness kit:', error);
    throw error;
  }
};

// Kit Files CRUD operations
export const getKitFiles = async (kitId: string): Promise<KitFile[]> => {
  const { data, error } = await supabase
    .from('kit_files')
    .select('*')
    .eq('kit_id', kitId)
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching kit files:', error);
    throw error;
  }
  
  return data || [];
};

export const addKitFile = async (file: Omit<KitFile, 'id' | 'created_at'>): Promise<string> => {
  const newFile = {
    ...file,
    id: uuidv4(),
    created_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('kit_files')
    .insert(newFile)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding kit file:', error);
    throw error;
  }
  
  return data.id;
};

export const deleteKitFile = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('kit_files')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting kit file:', error);
    throw error;
  }
};

// Kit Subscribers CRUD operations
export const addKitSubscriber = async (subscriber: Omit<KitSubscriber, 'id' | 'created_at'>): Promise<string> => {
  const newSubscriber = {
    ...subscriber,
    id: uuidv4(),
    created_at: new Date().toISOString()
  };
  
  console.log('Adding kit subscriber:', newSubscriber);
  
  try {
    const { data, error } = await supabase
      .from('kit_subscribers')
      .insert(newSubscriber)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding kit subscriber:', error);
      throw error;
    }
    
    console.log('Successfully added kit subscriber:', data);
    return data.id;
  } catch (error) {
    console.error('Exception adding kit subscriber:', error);
    throw error;
  }
};

export const getKitSubscribers = async (kitId: string): Promise<KitSubscriber[]> => {
  const { data, error } = await supabase
    .from('kit_subscribers')
    .select('*')
    .eq('kit_id', kitId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching kit subscribers:', error);
    throw error;
  }
  
  return data || [];
};

// File upload functions
export const uploadKitHeroImage = async (file: File, kitId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${kitId}/hero-image.${fileExt}`;
  const filePath = `kindness-kits/${fileName}`;
  
  const { error } = await supabase.storage
    .from('public')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    console.error('Error uploading hero image:', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from('public')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

export const uploadKitFile = async (file: File, kitId: string, fileType: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `kindness-kits/${kitId}/files/${fileName}`;
  
  const { error } = await supabase.storage
    .from('public')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    console.error('Error uploading kit file:', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from('public')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};