import { useState, useEffect } from 'react';
import { useForm,  } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import groupSweaters from '../assets/group-sweaters.svg'


import './RepairPage.css';
import camera from '../assets/camera.svg';

export default function RepairPage() {

  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if(!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    }
    fileReader.readAsDataURL(file);
  }, [file])

  const handleSelectImage = (e) => {
    let selectedFile;
    if(e.target.files && e.target.files.length === 1){
      selectedFile = e.target.files[0];
      setFile(selectedFile);
    }
  }

  if(!previewUrl) {
    return (
      <main className="repair-page">
        <h1>Garment Repair</h1>
        <div className="image-upload-container">
          <label htmlFor={"garment"}></label>
          <img src={camera}></img>
          <h3>Upload Image</h3>
          <input id="garment"style={{display: "none"}} type="file" accept=".jpg,.png,.jpeg" onChange={handleSelectImage}/>
        </div>
      </main>
    )
  }else {
    if(loading){
      return (
        <main className="repair-page">
          <h1>Garment Repair</h1>
          <p>Loading...</p>
        </main>
      )
    }else {
      return (
        <main className="repair-page">
          <h1>Garment Repair</h1>
          <div className="image-preview-container">
            <img src={previewUrl} alt="Garment Preview" />
          </div>
          <section className="details-section">
            <div className="details-section__img">
              <img src={groupSweaters}></img>
            </div>
            <div className="details-section__content">
              <Tabs className="tabs" defaultValue="account">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent className="tab-content" value="account">Make changes to your account here.</TabsContent>
                <TabsContent className="tab-content" value="password">Change your password here.</TabsContent>
              </Tabs>
            </div>
          </section>
          <section className="links-section">
            <h1>Helpful Links</h1>
            <div className="links-container">
              <Card className="card">
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card Content</p>
                </CardContent>
                <CardFooter>
                  <p>Card Footer</p>
                </CardFooter>
              </Card>
              <Card className="card">
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card Content</p>
                </CardContent>
                <CardFooter>
                  <p>Card Footer</p>
                </CardFooter>
              </Card>
              <Card className="card">
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card Content</p>
                </CardContent>
                <CardFooter>
                  <p>Card Footer</p>
                </CardFooter>
              </Card>
            </div>
          </section>
          <section className="saved-section">
            <h1>Amount Saved</h1>
            
          </section>
          <section className="inspiration-section"> 
            <h1>Inspiration</h1>
          </section>
        </main>
      )
    }
  }
}