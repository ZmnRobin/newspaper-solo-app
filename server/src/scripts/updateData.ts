import elasticClient from '../config/elasticsearch';

const INDEX_NAME = 'articles';

const updateMapping = async () => {
  try {
    await elasticClient.indices.putMapping({
      index: INDEX_NAME,
      body: {
        properties: {
          totalViewsLong: { type: 'long' }
        }
      }
    });
    console.log('Mapping updated successfully');
  } catch (error) {
    console.error('Error updating mapping:', error);
    throw error;
  }
};

const updateDocuments = async () => {
  try {
    const response = await elasticClient.updateByQuery({
      index: INDEX_NAME,
      conflicts: 'proceed',
      wait_for_completion: false,
      body: {
        script: {
          source: `
            if (ctx._source.totalViews == null) {
              ctx._source.totalViewsLong = 0L;
            } else if (ctx._source.totalViews instanceof String) {
              ctx._source.totalViewsLong = Long.parseLong(ctx._source.totalViews);
            } else {
              ctx._source.totalViewsLong = ctx._source.totalViews;
            }
          `,
          lang: 'painless'
        }
      }
    });
    return response.task;
  } catch (error) {
    console.error('Error updating documents:', error);
    throw error;
  }
};

const checkTaskStatus = async (taskId: string) => {
  try {
    const response = await elasticClient.tasks.get({ task_id: taskId });
    return response;
  } catch (error) {
    console.error('Error checking task status:', error);
    throw error;
  }
};

const waitForUpdate = async (taskId: string) => {
  while (true) {
    const taskStatus = await checkTaskStatus(taskId);
    if (taskStatus.completed) {
      console.log('Document update completed successfully');
      return;
    }
    console.log(`Update in progress... ${taskStatus.task.status.updated}/${taskStatus.task.status.total} documents processed`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
  }
};

const updateElasticsearch = async () => {
  try {
    await updateMapping();
    const taskId = await updateDocuments();
    await waitForUpdate(taskId as string);
    console.log('Elasticsearch update completed');
  } catch (error) {
    console.error('Update failed:', error);
  }
};

// Run the update
updateElasticsearch().then(() => {
  console.log('Update finished. You can now update your application to use totalViewsLong for sorting.');
  process.exit(0);
}).catch((error) => {
  console.error('Update failed:', error);
  process.exit(1);
});