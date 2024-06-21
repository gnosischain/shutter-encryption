import { Connect } from '@/components/Connect';

export const Header = () => {
  return (
    <div className="h-12 items-center bg-background w-full flex justify-between p-2">
      <div className="text-3xl">Shutter</div>
      <Connect />
    </div>
  )
}