import './index.css'
import './App.css'
import { Button } from "@/components/ui/button"

function App() {

  return (
   <div className='flex flex-col justify-center items-center h-screen gap-10'>
    <h1 className='text-3xl font-bold underline'>
      Hello
    </h1>
    <Button>Click me</Button>
   </div>
  )
}

export default App
