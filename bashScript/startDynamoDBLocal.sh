if [ -f .dynamodb.pid ]; then
    echo "Found file .dynamodb.pid. Not starting."
    exit 1
fi

serverless dynamodb start &> DB_output.txt &
PID=$!
echo $PID > .dynamodb.pid &
while ! grep "Dynamodb Local Started" DB_output.txt
do sleep 1; done

# wait for migration data
while ! grep "Serverless: DynamoDB - created table" DB_output.txt
do sleep 1; done

rm DB_output.txt