import { useState } from 'react';

import { Input } from "@/components/ui/input"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import greenYarn from '../assets/GreenYarn.png';

import './ExplorePage.css';

export default function ExplorePage() {
  return (
    <main className="explorer-page">
      <Input className="search-bar" placeholder="Search..." />
      <h3>Filters</h3>
      <div className="line-break"></div>
      <div>
          <ToggleGroup className="toggle-group" type="multiple">
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
      </div>
      <div>
        <ToggleGroup className="toggle-group" type="multiple">
            <ToggleGroupItem className="toggle-item" value="knitting" aria-label="Toggle red">
              Red
            </ToggleGroupItem>
            <ToggleGroupItem className="toggle-item" value="crochet" aria-label="Toggle orange">
              Orange
            </ToggleGroupItem>
            <ToggleGroupItem className="toggle-item" value="embroidery" aria-label="Toggle yellow">
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
      </div>
      <h1>Explore Trending Designs To Inspire Your Repairs</h1>
      <div className="img-container">
        <img src={greenYarn}></img>
      </div>
      <div className="card-container">

      </div>

    </main>
  )
}