'use client'
import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'


export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState("")

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => inventoryList.push({name: doc.id, ...doc.data()}))
    setInventory(inventoryList)
    console.log(inventoryList)
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const {quantity} = docSnap.data()
      if (quantity === 1){
        await deleteDoc(docRef)
        console.log("Document successfully deleted!") 
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }

    await updateInventory()
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity : quantity + 1})
      } else {
        await setDoc(docRef, {quantity : 1})
      }

    await updateInventory()
  }


  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

 
  return (
    <Box width="100vw" height="100vh" display="flex" justifyContent={"center"} alignItems="center" gap={2} flexDirection="column" bgcolor="#f5f5f5" padding={4}>
      <Modal open={open} onClose={handleClose}>
        <Box position="absolute" top="50%" left="50%" width={400} 
        bgcolor="white" border="2px solid #000" 
        boxShadow={24} p={4} display="flex" flexDirection="column" gap={3} sx={{transform: "translate(-50%, -50%)" }}>
          
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" gap={2}>
          <TextField
            id="outlined-basic"
            label="Item"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
          >
            Add
          </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" color="primary" onClick={handleOpen}>ADD NEW ITEM</Button>
      <Box border="1px solid #333" width="800px" borderRadius={4} boxShadow={3} bgcolor="#fff">
        <Box
          width="100%"
          height="100px"
          bgcolor="#1976d2"
          alignItems="center"
          justifyContent="center"
          display="flex"
          padding={2}
        >
          <Typography variant="h2" color="#fff">
            Inventory Items
          </Typography>
        </Box>
     
        <Stack width="100%" height="300px" spacing={2} overflow="auto" padding={2}>
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="100px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={2}
              borderRadius={2}
              boxShadow={1}
            >
              <Typography variant="h5" color="#333">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h5" color="#333">
                {quantity}
              </Typography>
              <Button variant="contained" color="secondary" onClick={() => removeItem(name)}>
                Remove 
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
