import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Address } from '@/types/order';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
});

interface AddressFormProps {
  defaultValues?: Address;
  onSubmit: (address: Address) => void;
  title?: string;
  buttonText?: string;
}

const AddressForm: React.FC<AddressFormProps> = ({
  defaultValues,
  onSubmit,
  title = 'Address',
  buttonText = 'Continue',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div>
        <label htmlFor="street" className="block text-sm font-medium mb-1">
          Street Address
        </label>
        <Input
          id="street"
          {...register('street')}
          error={errors.street?.message}
          placeholder="123 Main Street"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">
            City
          </label>
          <Input
            id="city"
            {...register('city')}
            error={errors.city?.message}
            placeholder="New York"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">
            State
          </label>
          <Input
            id="state"
            {...register('state')}
            error={errors.state?.message}
            placeholder="NY"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
            Zip Code
          </label>
          <Input
            id="zipCode"
            {...register('zipCode')}
            error={errors.zipCode?.message}
            placeholder="10001"
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-1">
            Country
          </label>
          <Input
            id="country"
            {...register('country')}
            error={errors.country?.message}
            placeholder="United States"
          />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Processing...' : buttonText}
      </Button>
    </form>
  );
};

export default AddressForm;

