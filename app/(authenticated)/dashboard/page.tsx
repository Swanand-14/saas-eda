"use client";
import { useUser } from "@clerk/nextjs";
import { Todo } from "@/app/generated/prisma";
import React, { useCallback, useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";


function Dashboard(){
    const {user} = useUser()
    const [todos,setTodos] = useState<Todo[]>([])
    const [searchTerm,setSearchTerm] = useState("")
    const [debounceSearchTerm] = useDebounceValue(searchTerm,300)
    const [loading,setloading] = useState(false)
    const [totalPages,setTotalPages] = useState()
    const [currentPage,setCurrentPage] = useState(1)
    const [subscription,setSubscription] = useState()
    const fetchTodos = useCallback(async (page:number) =>{
        try {
            setloading(true)
            const response = await fetch(`/api/todos?page=${page}&search=${debounceSearchTerm}`)
            if(!response.ok){

                throw new Error("Failed to fetch todos")
            }
            const data = await response.json()
            setTodos(data.todos)
            setTotalPages(data.totalPages)
            setCurrentPage(data.currentPage)
            setloading(false)
            
        } catch (error) {
            
        }
    },[debounceSearchTerm])

     const fetchSubsriptionStatus = async () =>{
        const response = await fetch("/api/subscription",{method:"GET",  credentials: "include", })
        if(!response.ok){
          const errText = await response.text();
  console.error("Fetch failed:", response.status, errText);
            throw new Error("Unable to fetch subscription")
        }
        const data = await response.json()
        setSubscription(data.isSubscribed);


    }

    useEffect(()=>{
        fetchTodos(1)
        fetchSubsriptionStatus()
    },[])
   

    const handleAddTodo = async(title:String) => {
        try {
           const response =  await fetch("/api/todos",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({title})



            })
            if(!response.ok){
                throw new Error("Failed to add todo")

            }
            await fetchTodos(currentPage)
        } catch (error) {
            throw new Error("Unable to add todo")
        }
    }
    const handleUpdateTodo = async(id:string,completed:boolean) => {
        try {
           const response =  await fetch(`/api/todos/${id}`,{
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({completed})

            }) 
            if(!response.ok){
                throw new Error('Failed to update Todo')
            }
            await fetchTodos(currentPage)
        } catch (error) {
             throw new Error("Unable to update todo")
        }

        
    }
    const handleDeleteTodo = async(id:String) => {
           const response  =  await fetch(`/api/todos/${id}`,{
            method:"DELETE"
       
           })
           if(!response.ok){
            throw new Error("Unable to delete todo")
           }
           await fetchTodos(currentPage)
           


        }
    return (
       <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.firstName || "User"} 👋</h1>

      {/* Search + Add Todo */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search todos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          onClick={() => {handleAddTodo(searchTerm)}}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          + Add
        </button>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-500">Loading todos...</p>
        ) : todos.length === 0 ? (
          <p className="text-gray-500">No todos found</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex justify-between items-center border rounded-lg px-4 py-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => {handleUpdateTodo(todo.id,!todo.completed)}}
                  className="h-4 w-4"
                />
                <span className={todo.completed ? "line-through text-gray-500" : ""}>
                  {todo.title}
                </span>
              </div>
              <button
                onClick={() => {handleDeleteTodo(todo.id)}}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <p>
          Page {currentPage} of {totalPages || 1}
        </p>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
    )
}

export default Dashboard;

