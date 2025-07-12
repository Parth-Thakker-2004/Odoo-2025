import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
// Remove zodResolver since we're using manual validation
import { MultiSelect } from '../../components/MultiSelect';

// Define the form schema with Zod
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
  location: z.string().min(2, 'Location is required'),
  skillsOffered: z.array(z.string()).default([]),
  skillsWanted: z.array(z.string()).default([]),
  availability: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Use exact type definition to avoid inference issues
type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
};

const availabilityOptions = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'mornings', label: 'Mornings' },
  { value: 'afternoons', label: 'Afternoons' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'nights', label: 'Nights' },
  { value: 'flexible', label: 'Flexible' },
];

// Common skills options for suggestions
const commonSkillsOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'react', label: 'React' },
  { value: 'node', label: 'Node.js' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'java', label: 'Java' },
  { value: 'c#', label: 'C#' },
];

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // We'll use React Hook Form's setValue instead of separate state variables

  // Use a simpler approach without zodResolver to avoid type issues
  const form = useForm<SignupFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      location: '',
      skillsOffered: [],
      skillsWanted: [],
      availability: [],
      isPublic: true,
    },
  });

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Manual validation since we're not using zodResolver
    if (data.name.length < 2) {
      setErrorMessage('Name must be at least 2 characters');
      setIsLoading(false);
      return;
    }
    
    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrorMessage('Please provide a valid email address');
      setIsLoading(false);
      return;
    }
    
    if (data.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }
    
    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords don't match");
      setIsLoading(false);
      return;
    }
    
    if (data.location.length < 2) {
      setErrorMessage('Location is required');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      setSuccessMessage("Registration successful! You can now log in with your credentials.");
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg border shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold">Create an account</h3>
          <p className="text-sm text-gray-500">
            Enter your information to create your account
          </p>
        </div>
        
        <div className="p-6 pt-0">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${
                  form.formState.errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="johndoe@example.com"
                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${
                  form.formState.errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            
            {/* Password fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="********"
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${
                    form.formState.errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${
                    form.formState.errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...form.register('confirmPassword')}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            
            {/* Location field */}
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="City, Country"
                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${
                  form.formState.errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                {...form.register('location')}
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.location.message}
                </p>
              )}
            </div>
            
            {/* Skills Offered field */}
            <div className="space-y-2">
              <label htmlFor="skillsOffered" className="text-sm font-medium">
                Skills you can offer
              </label>
              <MultiSelect 
                options={commonSkillsOptions}
                selected={form.watch('skillsOffered')}
                onChange={(selected) => form.setValue('skillsOffered', selected)}
                placeholder="Select or type skills you can offer..."
              />
              {form.formState.errors.skillsOffered && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.skillsOffered.message}
                </p>
              )}
            </div>
            
            {/* Skills Wanted field */}
            <div className="space-y-2">
              <label htmlFor="skillsWanted" className="text-sm font-medium">
                Skills you want to learn
              </label>
              <MultiSelect 
                options={commonSkillsOptions}
                selected={form.watch('skillsWanted')}
                onChange={(selected) => form.setValue('skillsWanted', selected)}
                placeholder="Select or type skills you want to learn..."
              />
              {form.formState.errors.skillsWanted && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.skillsWanted.message}
                </p>
              )}
            </div>
            
            {/* Availability field */}
            <div className="space-y-2">
              <label htmlFor="availability" className="text-sm font-medium">
                Availability
              </label>
              <MultiSelect 
                options={availabilityOptions}
                selected={form.watch('availability')}
                onChange={(selected) => form.setValue('availability', selected)}
                placeholder="Select your availability..."
              />
              {form.formState.errors.availability && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.availability.message}
                </p>
              )}
            </div>
            
            {/* Public Profile checkbox */}
            <div className="flex items-center space-x-3">
              <input
                id="isPublic"
                type="checkbox"
                className="rounded"
                {...form.register('isPublic')}
              />
              <div>
                <label htmlFor="isPublic" className="text-sm font-medium">
                  Make my profile public
                </label>
                <p className="text-sm text-gray-500">
                  Your profile will be visible to other users
                </p>
              </div>
            </div>
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center w-full rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
        
        <div className="flex items-center justify-center p-6 pt-0">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
