import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { TaskProvider } from "../context/TaskContext";

export default function App() {
  return (
    <TaskProvider>
      <RouterProvider router={router} />
    </TaskProvider>
  );
}
console.log('React mounted');