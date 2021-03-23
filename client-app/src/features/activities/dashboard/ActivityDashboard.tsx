import { observer } from 'mobx-react-lite';
import React from 'react'
import { Grid } from 'semantic-ui-react';
import { useStore } from '../../../app/stores/store';
import ActivityForm from '../../form/ActivityForm';
import ActivityDetails from '../details/ActivityDetails';
import ActivityList from './ActivityList';

const ActivityDashboard = () => {
    const {activityStore} = useStore();
    
    return (
        <Grid>
            <Grid.Column width='10'>
                <ActivityList />
            </Grid.Column>
            <Grid.Column width='6'>
                {activityStore.selectedActivity && !activityStore.editMode &&
                    <ActivityDetails  /> 
                }
                {activityStore.editMode &&
                    <ActivityForm /> 
                }
            </Grid.Column>
        </Grid>
    )
}

export default observer(ActivityDashboard)
