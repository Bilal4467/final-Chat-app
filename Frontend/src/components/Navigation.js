import React from "react";
import "./Navigation.css";
import { Nav, Navbar, Container, Button, NavDropdown } from "react-bootstrap";
import { useLogoutUserMutation } from "../services/appApi";
import { useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import logo from "../assets/tech_over_flow.png";

function Navigation() {
    const user = useSelector((state) => state.user);
    const [logoutUser] = useLogoutUserMutation();
    // logout user
    async function handleLogout(e) {
        e.preventDefault();
        await logoutUser(user);
        // redirect to home page
        window.location.replace("/login");
    }
    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <LinkContainer to="#">
                    <Navbar.Brand>
   {/* setting logo */}
                        <img src={logo} style={{ width: 150, height: 50 }} />
                    </Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {/* navbar buttons and links for non-user */}
                        {!user && (
                            
                            <LinkContainer to="/login">
                         
                                <Nav.Link>
                                <Button variant="primary" type="submit">Login </Button></Nav.Link>
                            
                            </LinkContainer>
                          
                        )}

                        {!user && (
                             <LinkContainer to="/signup">
                                <Nav.Link> <Button variant="primary" type="submit">Signup </Button></Nav.Link>
                            </LinkContainer>
                        )}
                        <LinkContainer to="/chat">
                            <Nav.Link> <Button variant="primary" type="submit">Chat </Button></Nav.Link>
                        </LinkContainer>
{/* drop down user info */}
                        {user && (
                            <NavDropdown
                                title={
                                    <>
                                        <img src={user.picture} style={{ width: 30, height: 30, marginRight: 10, objectFit: "cover", borderRadius: "50%" }} />
                                        {user.name}
                                    </>
                                }
                                id="basic-nav-dropdown"
                            >
                                {/* <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item> */}

                                <NavDropdown.Item>
                                    <Button variant="danger" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navigation;
