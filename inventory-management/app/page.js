'use client'
import { useState, useEffect, useRef } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, InputAdornment } from '@mui/material'
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
//testing purposes only
//import React, { useRef } from "react";
import { Camera } from "react-camera-pro";

export default function Home() {
  //set default for variables
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState("")
  const [totalNumberOfItems, setQuantity] = useState(1)
  const [myQuery, setQuery] = useState('')
  const [showPhotos, setShowPhotos] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);




  //use to display the inventory
  const updateInventory = async (searchQuery = '') => {
    const snapshot = query(collection(firestore, "inventory"))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => inventoryList.push({ name: doc.id, ...doc.data() }))
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i')
      const filteredInventory = inventoryList.filter(item => regex.test(item.name))
      setInventory(filteredInventory)
    } else {
      setInventory(inventoryList)
    }
    console.log(inventoryList)
  }

  const Photos = () => {
    const camera = useRef(null);
    const [image, setImage] = useState(null);

    return (
      <div>
        <Camera ref={camera} aspectRatio={16 / 9} />
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (camera.current) {
              setImage(camera.current.takePhoto());
            }
          }}
          style={{ marginTop: '10px' }}
        >
          Take Photo
        </Button>
        {image && <img src={image} alt="Taken photo" style={{ marginTop: '10px' }} />}
      </div>
    );
  };

  //remove item
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
        console.log("Document successfully deleted!")
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }

    await updateInventory()
  }


  //add item
  const addItem = async (item, numbers) => {
    numbers == 0 ? numbers = 1 : numbers
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      !numbers || numbers === 0 ? numbers = 1 : numbers
      await setDoc(docRef, { quantity: quantity + numbers })
    } else {
      await setDoc(docRef, { quantity: numbers })
    }

    await updateInventory()
  }


  //initial
  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)


  const handlePhotoModalOpen = () => setPhotoModalOpen(true);
  const handlePhotoModalClose = () => setPhotoModalOpen(false);




  return (
    <Box width="100vw" height="100vh" display="flex" justifyContent={"center"} alignItems="center" gap={2} flexDirection="column" bgcolor="#f5f5f5" padding={4}>
      <Modal open={open} onClose={handleClose}>
        <Box position="absolute" top="50%" left="50%" width={400}
          bgcolor="white" border="2px solid #000"
          boxShadow={24} p={4} display="flex" flexDirection="column" gap={3} sx={{ transform: "translate(-50%, -50%)" }}>

          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" gap={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              InputLabelProps={{
                shrink: true,
                required: true,
              }}
              onChange={(e) => setItemName(e.target.value)}
            />

            <TextField
              label="Quantity"
              type="number"
              value={totalNumberOfItems}
              onChange={(e) => setQuantity(Number(e.target.value))}
              InputLabelProps={{
                shrink: true,
                required: true,
              }}
              InputProps={{
                inputProps: { min: 1 },
                endAdornment: <InputAdornment position="end"> </InputAdornment>,
              }}
              variant="outlined"
            />

            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName, totalNumberOfItems)
                setItemName('')
                setQuantity(1)
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      
      <Modal open={photoModalOpen} onClose={handlePhotoModalClose}>
        <Box position="absolute" top="50%" left="50%" width={800} height={800}
          bgcolor="white" border="2px solid #000"
          boxShadow={24} p={4} display="flex" flexDirection="column" gap={3} sx={{ transform: "translate(-50%, -50%)" }}>

          <Typography variant="h6">Take Photo</Typography>
          <Photos />
          <Button variant="contained" onClick={handlePhotoModalClose} style={{ marginTop: '10px' }}>Close</Button>
        </Box>
      </Modal>

      <Box display="flex" justifyContent="center" alignItems="center">
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            ADD BY NAME
          </Button>
          <Button variant="contained" onClick={handlePhotoModalOpen}>
            ADD BY PHOTO
          </Button>
        </Stack>
      </Box>


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

        <Box width="100%" display="flex" alignItems="center" justifyContent="center" padding={2}>
          <TextField
            variant='outlined'
            placeholder='Search'
            value={myQuery}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    onClick={() => {
                      updateInventory(myQuery)
                    }}
                  >
                    Search
                  </Button>
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </Box>

        <Stack width="100%" height="300px" spacing={2} overflow="auto" padding={2}>
          {inventory.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="100%"
              height="100%"
              textAlign="center"
            >
              <Typography variant="h4" color="textSecondary">
                No items found.
              </Typography>
            </Box>
          ) : (
            inventory.map(({ name, quantity }) => (
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
            ))
          )}
        </Stack>
      </Box>
    </Box>
  )
}
