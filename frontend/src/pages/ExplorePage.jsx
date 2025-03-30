import { motion } from 'motion/react'

import { useState } from 'react';

import { Input } from "@/components/ui/input"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import greenYarn from '../assets/GreenYarn.png';

import { useForm, Controller } from 'react-hook-form';

import './ExplorePage.css';



export default function ExplorePage() {

  const [images, setImages] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      query: "",
      filters: {
        type: [],
        colors: [],
      },
    },
  });


  const onSubmit = async (data) => {
    const { query, filters } = data;
  
    const requestData = {
      query,
      filters: {
        type: filters.type,
        colors: filters.colors,
      },
    };
  
    try {
      const response = await fetch('http://localhost:8000/search_images/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      if (response.ok) {
        const result = await response.json();
        if (result.items) {
          setImages(result.items);
        } else {
          setImages([]);
        }
      } else {
        console.error('Error with the request:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };


  return (
    <main className="explorer-page">
       <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          register={register}
          id="query"
          className="search-bar"
          placeholder="Search..."
        />

        <h3>Filters</h3>
        <div className="line-break"></div>

        <div>
          <Controller
            name="filters.type"
            control={control}
            render={({ field }) => (
              <ToggleGroup
                {...field}
                className="toggle-group"
                type="multiple"
                onValueChange={(value) => field.onChange(value)}
                value={field.value}
              >
                <ToggleGroupItem className="toggle-item" value="knitting" aria-label="Toggle knitting">
                  Knitting
                </ToggleGroupItem>
                <ToggleGroupItem className="toggle-item" value="crochet" aria-label="Toggle crochet">
                  Crochet
                </ToggleGroupItem>
                <ToggleGroupItem className="toggle-item" value="embroidery" aria-label="Toggle embroidery">
                  Embroidery
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          />
        </div>

        <div>
          <Controller
            name="filters.colors"
            control={control}
            render={({ field }) => (
              <ToggleGroup
                {...field}
                className="toggle-group"
                type="multiple"
                onValueChange={(value) => field.onChange(value)}
                value={field.value}
              >
                <ToggleGroupItem className="toggle-item" value="red" aria-label="Toggle red">
                  Red
                </ToggleGroupItem>
                <ToggleGroupItem className="toggle-item" value="orange" aria-label="Toggle orange">
                  Orange
                </ToggleGroupItem>
                <ToggleGroupItem className="toggle-item" value="yellow" aria-label="Toggle yellow">
                  Yellow
                </ToggleGroupItem>
                <ToggleGroupItem className="toggle-item" value="green" aria-label="Toggle green">
                  Green
                </ToggleGroupItem>
                <ToggleGroupItem className="toggle-item" value="blue" aria-label="Toggle blue">
                  Blue
                </ToggleGroupItem>
                <ToggleGroupItem className="toggle-item" value="pink" aria-label="Toggle pink">
                  Pink
                </ToggleGroupItem>
                <ToggleGroupItem className="toggle-item" value="purple" aria-label="Toggle purple">
                  Purple
                </ToggleGroupItem>
                <ToggleGroupItem className="toggle-item" value="brown" aria-label="Toggle brown">
                  Brown
                </ToggleGroupItem>
                <ToggleGroupItem className="toggle-item" value="black" aria-label="Toggle black">
                  Black
                </ToggleGroupItem>
                <ToggleGroupItem className="toggle-item" value="white" aria-label="Toggle white">
                  White
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          />
        </div>
      </form>
      <h1>Explore Trending Designs To Inspire Your Repairs</h1>
      <div className="img-container">
        <img src={greenYarn}></img>
      </div>
      {images && 
        <motion.div 
        className="card-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {images.map((image, index) => (
          <motion.div 
            key={index} 
            className="card border rounded overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.5
            }}
          >
            <img
              src={image.link}
              alt={image.title}
              className="w-full h-auto object-cover"
            />
          </motion.div>
        ))}
      </motion.div>}

    </main>
  )
}