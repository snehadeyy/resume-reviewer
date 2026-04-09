import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { AuthContextProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"

function App() {

  return (
    <>
      <AuthContextProvider>
        <InterviewProvider>
          <RouterProvider router={router} />
        </InterviewProvider>
      </AuthContextProvider>
    </>
  )
}

export default App
