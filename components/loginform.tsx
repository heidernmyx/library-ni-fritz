/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { Input } from '@/components/ui/input'
import React from 'react'
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from './ui/label';
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'

const formFieldSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

type FormFields = z.infer<typeof formFieldSchema>;

const LoginForm = () => {

  const  { register, handleSubmit, formState: { errors }, setError} = useForm<FormFields>({
    resolver: zodResolver(formFieldSchema)
  });
  
  const credentialLogin = async (data: FormFields) => {
    try {
      
      const { email, password } = data;

      const response = await signIn('credentials', {
        email: email,
        password: password,
        redirect: false
      })
  
      if (response?.error) {
        setError("root", {
          message: response.error || 'Invalid credentials'
        });
      } else {
        console.log('Login successful');
        // You can redirect or handle success here manually
      }
  
    } catch (err) {
      console.error(err);
      setError("root", {
        message: 'Error Occurred'
      });
    }
  };
  
  
  return (
    <>
      <form onSubmit={handleSubmit(credentialLogin)}>
        <Label>Email</Label>
        <Input {...register('email', {
          required: "Email is required."
        })} type='email'/>
        {errors.email && <div className='text-destructive'>{errors.email.message}</div>}
        <br/>
        <Label>Password</Label>
        <Input {...register('password', {
          required: "Password is required."
        })} 
          type='password'
        />
        {errors.password && <div className='text-destructive'>{errors.password.message}</div>}
        <br/>
        <Button>Login</Button>
        {errors.root && <div className='text-destructive'>{errors.root.message}</div>}
      </form>
    </>
  )
}

export default LoginForm;
