import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { UserClass } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone, GraduationCap } from 'lucide-react';

interface ProfileSetupModalProps {
  onComplete: () => void;
}

export default function ProfileSetupModal({ onComplete }: ProfileSetupModalProps) {
  const [fullName, setFullName] = useState('');
  const [userClass, setUserClass] = useState<UserClass | ''>('');
  const [contactNumber, setContactNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const saveProfile = useSaveCallerUserProfile();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!userClass) newErrors.userClass = 'Please select your class';
    if (!contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    else if (!/^\d{10}$/.test(contactNumber.replace(/\s/g, ''))) {
      newErrors.contactNumber = 'Enter a valid 10-digit number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await saveProfile.mutateAsync({
        fullName: fullName.trim(),
        userClass: userClass as UserClass,
        contactNumber: contactNumber.trim(),
      });
      onComplete();
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-4">
            <GraduationCap className="h-8 w-8 text-navy" />
          </div>
          <h2 className="text-2xl font-bold text-navy">Complete Your Profile</h2>
          <p className="text-gray-500 mt-1 text-sm">Just a few details to get you started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-navy font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 border-gray-200 focus:border-navy focus:ring-navy"
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
          </div>

          {/* Class */}
          <div className="space-y-1.5">
            <Label htmlFor="userClass" className="text-navy font-medium">
              Class
            </Label>
            <Select value={userClass} onValueChange={(v) => setUserClass(v as UserClass)}>
              <SelectTrigger className="border-gray-200 focus:border-navy focus:ring-navy">
                <SelectValue placeholder="Select your class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserClass.eleventh}>11th</SelectItem>
                <SelectItem value={UserClass.twelfth}>12th</SelectItem>
                <SelectItem value={UserClass.dropper}>Dropper</SelectItem>
              </SelectContent>
            </Select>
            {errors.userClass && <p className="text-red-500 text-xs">{errors.userClass}</p>}
          </div>

          {/* Contact Number */}
          <div className="space-y-1.5">
            <Label htmlFor="contactNumber" className="text-navy font-medium">
              Contact Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="contactNumber"
                type="tel"
                placeholder="10-digit mobile number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="pl-10 border-gray-200 focus:border-navy focus:ring-navy"
                maxLength={10}
              />
            </div>
            {errors.contactNumber && <p className="text-red-500 text-xs">{errors.contactNumber}</p>}
          </div>

          {saveProfile.isError && (
            <p className="text-red-500 text-sm text-center">
              Failed to save profile. Please try again.
            </p>
          )}

          <Button
            type="submit"
            disabled={saveProfile.isPending}
            className="w-full bg-navy hover:bg-navy-dark text-white font-semibold py-3 rounded-xl transition-all"
          >
            {saveProfile.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Continue to Dashboard'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
