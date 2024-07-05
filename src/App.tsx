import { MainPage } from '@/pages/MainPage';
import { Header } from '@/components/Header';

function App() {
  return (
    <main className="light text-foreground bg-background">
      <div>
        <Header />
        <MainPage />
      </div>
    </main>
  )
}

export default App
