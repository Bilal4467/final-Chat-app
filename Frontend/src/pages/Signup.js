import React, { useState } from "react";
import { Col, Container, Form, Row, Button } from "react-bootstrap";
import { useSignupUserMutation } from "../services/appApi";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import botImg from "../assets/OpenAnAccount.png";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [signupUser, { isLoading, error }] = useSignupUserMutation();
    const navigate = useNavigate();
    //image upload states
    const [image, setImage] = useState(null);
    const [upladingImg, setUploadingImg] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    function validateImg(e) {
        const file = e.target.files[0];
        //setting thr msx sixe of inm
        if (file.size >= 1048576) {
            //show alert message
            return alert("Max file size is 1mb");
        } else {
            //setStates
            setImage(file);
            // uplaod the image
            setImagePreview(URL.createObjectURL(file));
        }
    }
// retun a promise uplaod image
    async function uploadImage() {
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "empxn0wa");
        try {
            setUploadingImg(true);
            // await a n other promise fetching the image data from api
            let res = await fetch("https://api.cloudinary.com/v1_1/dersaxowt/image/upload", {
                method: "post",
                body: data,
            });
            //waiting for promise responce
            const urlData = await res.json();
            setUploadingImg(false);
            //retuning the frtched data
            return urlData.url;
        } catch (error) {
            setUploadingImg(false);
            console.log(error);
        }
    }
//submit 
    async function handleSignup(e) {
        e.preventDefault();
        if (!image) return alert("Please upload your profile picture");
        const url = await uploadImage(image);
        console.log(url);
        // signup the user and redirected to the chat page
        signupUser({ name, email, password, picture: url }).then(({ data }) => {
            if (data) {
                console.log(data);
                navigate("/chat");
            }
        });
    }

    return (
        <Container>
            <Row>
                <Col md={7} className="d-flex align-items-center justify-content-center flex-direction-column">
                    <Form style={{ width: "80%", maxWidth: 500 }} onSubmit={handleSignup}>
                        <h1 className="text-center">Create account</h1>
                        <div className="signup-profile-pic__container">
                            {/* if there is no image then show bot image otherwise show the upload file to the container  */}
                            <img src={imagePreview || botImg} className="signup-profile-pic"  alt="SignUp"/>
                            <label htmlFor="image-upload" className="image-upload-label">
                                <i className="fas fa-plus-circle add-picture-icon"></i>
                            </label>
                            <input type="file" id="image-upload" hidden accept="image/png, image/jpeg" onChange={validateImg} />
                        </div>
                        {error && <p className="alert alert-danger">{error.data}</p>}
                        <Form.Group className="mb-3" controlId="formBasicName">
                            {/* setting up the name value */}

                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Your name" onChange={(e) => setName(e.target.value)} value={name} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            {/* setting up the email value */}

                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} value={email} />
                            <Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            {/* setting up the password value */}

                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} />
                        </Form.Group>
                            {/* adding animation after signup button clicked */}
                        
                        <Button variant="primary" type="submit">
                            {upladingImg || isLoading ? "Signing you up..." : "Signup"}
                        </Button>
                        <div className="py-4">
                            <p className="text-center">
                                Already have an account ? <Link to="/login">Login</Link>
                            </p>
                        </div>
                    </Form>
                </Col>
                <Col md={5} className="signup__bg"></Col>
            </Row>
        </Container>
    );
}

export default Signup;
