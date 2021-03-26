import { observer } from 'mobx-react-lite'
import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Container, Header, Image, Segment } from 'semantic-ui-react'
import { useStore } from '../../app/stores/store'
import LoginForm from '../users/LoginForm'
import RegisterForm from '../users/RegisterForm'

const HomePage = () => {
    const {userStore, modalStore} = useStore();
    return (
        <Segment inverted textAlign='center' vertical className='masthead' >
            <Container text>
                <Header as='h1' inverted>
                    <Image size='massive' src='/assets/logo.png' alt='logo' style={{marginBotton: 12}} />
                    Reactivities
                </Header>
                <Header as='h2' inverted content='Welcome to Reactivities' />
                {!userStore.isLoggedIn ? (
                    <>
                        <Button onClick={() => modalStore.openModal(<LoginForm />)} size='huge' inverted>
                            Login!
                        </Button>
                        <Button onClick={() => modalStore.openModal(<RegisterForm />)} size='huge' inverted>
                            Register!
                        </Button>
                    </>
                ) : (
                    <>
                        <Button as={Link} to='/activities' size='huge' inverted>
                            Go to Activities!
                        </Button>
                    </>    
                )}
                
            </Container>
        </Segment>
    )
}

export default observer( HomePage )
