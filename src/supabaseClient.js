import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjfuobscovlgowgxcbhu.supabase.co'; // Replace with your URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZnVvYnNjb3ZsZ293Z3hjYmh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3Njg0OTEsImV4cCI6MjA1NjM0NDQ5MX0.t0dYc-6xWIsdCl7Lwyh3nVG0J7RCldiAGz9j92ULvMc';     // Replace with your key
export const supabase = createClient(supabaseUrl, supabaseKey);