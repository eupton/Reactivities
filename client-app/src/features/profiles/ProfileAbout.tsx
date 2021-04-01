import React, { useState } from 'react'
import { Button, Grid, Header, Tab } from 'semantic-ui-react';
import { Profile } from '../../app/models/profile';
import { useStore } from '../../app/stores/store';
import ProfileAboutForm from './ProfileAboutForm';

interface Props {
    profile: Profile;
}

const ProfileAbout = ({profile}: Props) => {
    const [editMode, setEditMode] = useState(false);
    const {profileStore: {isCurrentUser}} = useStore();
    return (
        <Tab.Pane>
            <Grid>
                <Grid.Column width={16}>
                    <Header floated='left' icon='image' content={profile?.displayName} />
                    {isCurrentUser && (
                        <Button floated='right' basic
                            content={editMode ? 'Cancel' : 'Edit'}
                            onClick={() => setEditMode(!editMode)}
                        />
                    )}
                </Grid.Column>
                <Grid.Column width={16}>
                    {editMode ? (
                        <div>
                            <ProfileAboutForm profile={profile} />
                        </div>
                    ) : (
                        <div>
                            <span>display mode</span> 
                            {profile.displayName}
                            {profile.bio}
                        </div>
                    )}
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
}

export default ProfileAbout
