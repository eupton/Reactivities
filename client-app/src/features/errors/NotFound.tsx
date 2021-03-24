import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Header, Icon, Segment } from 'semantic-ui-react'

const NotFound = () => {
    return (
        <Segment placeholder>
            <Header icon>
                <Icon name='search' />
                Oops - We've searched everywhere and we couldn't find this.
            </Header>
            <Segment.Inline>
                <Button as={Link} to='/activities' content='Back to activities' primary />
            </Segment.Inline>            
        </Segment>
    )
}

export default NotFound
