import { useState, useEffect } from 'react';
import { useForm,  } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { motion } from 'motion/react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import yarnBall from '../assets/yarnball.svg';
import groupSweaters from '../assets/group-sweaters.svg'


import './RepairPage.css';
import camera from '../assets/camera.svg';

const repairInstructions = {
  denim: "To repair denim, use a denim patch or a sewing technique that incorporates heavy-duty thread. Make sure to reinforce the stitch at the edges to avoid future wear and tear.",
  wool: "For wool, use a wool-specific repair kit, and be sure to match the yarn or thread color. You can also use a felting technique for small holes.",
  cotton: "Cotton can be easily repaired using a simple running stitch or a patch. Ensure the patch is securely stitched with matching thread.",
  silk: "Silk requires delicate handling. Use a fine needle and thread, and consider a specialized fabric glue for invisible repairs. Avoid pulling or stretching the fabric.",
  leather: "Repair leather by applying a leather patch or a leather repair kit. Use leather-specific adhesive or stitching techniques to ensure a smooth, durable finish.",
  linen: "Linen can be repaired with a simple stitch or a patch. It's important to use a linen-compatible thread to blend well with the fabric.",
  polyester: "For polyester, use a polyester patch or sew over the damaged area with polyester thread to ensure durability. It's a synthetic fabric, so it's strong and easy to stitch.",
  nylon: "Nylon can be repaired with a nylon patch or fabric adhesive. Make sure to use a heavy-duty needle and thread to prevent further damage."
};


const getRepairInstructions = (material) => {
  return repairInstructions[material] || "Material not found. Please refer to general fabric care instructions.";
};

export default function RepairPage() {

  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [report, setReport] = useState({}); // To store the detected labels


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

  const handleSelectImage = async (e) => {
    let selectedFile;
    if(e.target.files && e.target.files.length === 1){
      selectedFile = e.target.files[0];
      setFile(selectedFile);
      setLoading(true);
      try {
        const formData = new FormData();
formData.append("file", selectedFile);

        const response = await fetch("http://localhost:8000/analyze/", {
          method: "POST",
          body: formData,
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setMessage(data.message);
          setReport(data.result); // Set the detected labels
        } else {
          setMessage(data.error || "An error occurred");
        }
      } catch (error) {
        setMessage("Error: " + error);
      }
      setLoading(false);
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
          <Dialog open={loading}>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent className="dialog-content">
                  <div>
                  <img className="yarn-ball" src={yarnBall}/>
                  </div>
                </DialogContent>
              </Dialog>
        </main>
      )
    }else {
      return (
        <main className="repair-page">
          <h1>Garment Repair</h1>
          <motion.div 
  className="image-preview-container" 
  whileInView={{ opacity: 1, y: 0 }} 
  initial={{ opacity: 0, y: 50 }} 
  transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
  viewport={{ once: true }}
>
  <img src={previewUrl} alt="Garment Preview" />
</motion.div>
<motion.section 
  className="details-section" 
  whileInView={{ opacity: 1, y: 0 }} 
  initial={{ opacity: 0, y: 50 }} 
  transition={{ duration: 0.6 }}
  viewport={{ once: true, amount: .4 }}
>
  <div className="details-section__img">
    <img src={groupSweaters} alt="Sweaters" />
  </div>
  <div className="details-section__content">
    <Tabs className="tabs" defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Report</TabsTrigger>
        <TabsTrigger value="password">Repair</TabsTrigger>
      </TabsList>
      <TabsContent className="tab-content" value="account">
          <div className="tab-content__section">
    <h3>Item:</h3>
    <p>{report.items}</p>
  </div>
  
  <div className="tab-content__section">
    <h3>Material:</h3>
    <p>{report.materials}</p>
  </div>
      </TabsContent>
      <TabsContent className="tab-content" value="password">
      <div className="tab-content__section">
    <h3>Repair</h3>
    <p>{getRepairInstructions(report.materials)}</p>
  </div>
      </TabsContent>
    </Tabs>
  </div>
</motion.section>
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