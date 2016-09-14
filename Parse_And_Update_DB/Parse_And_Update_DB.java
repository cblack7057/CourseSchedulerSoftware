package test_DB_Connection;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.bson.Document;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.Iterator;
import java.util.TreeMap;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;

/**
 * NOTE* Before Feeding in the CSV file you must make sure there are NO new line characters within a cell and no commas within a cell.
 * NOTE* When you remove the new line characters replace them with a '`' (New Line is Ctrl + J)
 *
 */
public class Parse_And_Update_DB 
{
	static BufferedReader reader;
	static BufferedWriter writer;
	static String readerFileName = "Section_Tally_RAW.csv";
	static String writerFileName = "Section_Tally_FORMAT.json";
	static final String TEXTURI = "mongodb://carlind0:123456@ds015334.mlab.com:15334/db_name";
	static final int MAX_DAY_OF_WEEK = 6;
	static final String collectionName = "testJava";
	static final String dbName = "db_name";
	
	public static void main(String[] args) throws IOException
	{
		List<Document> docList = new ArrayList<Document>();

		reader = new BufferedReader(new FileReader(readerFileName));
		writer = new BufferedWriter(new FileWriter(writerFileName));

		//Discard the header line in the CSV file.
		reader.readLine();

		while(reader.ready())
		{
			//populate the list of documents to be added to the DB
			Document doc = Document.parse(formatLine(reader.readLine()));
			docList.add(doc);
		}
		
		MongoClientURI uri = new MongoClientURI(TEXTURI);
		MongoClient mc = new MongoClient(uri);
		MongoDatabase db = mc.getDatabase(dbName);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		
		//remove the old collection
		collection.drop();
		
		//add the new collection
		collection.insertMany(docList);
		
		mc.close();
		
	}

	private static String formatLine(String readLine) throws IOException 
	{
		/*
		 * Desired Order:
		 * Subject
		 * Course
		 * Section
		 * Meetings:
		 * 		Type
		 * 		Days
		 * 		Times
		 * 		Building + Room
		 * Session
		 * CRN
		 * Title
		 * Professor
		 * Campus
		 * Credit Hours
		 */

		/*
		 * Given Order:
		 * 0 CRN
		 * 1 Subject
		 * 2 Course
		 * 3 Section
		 * 4 Part of Term
		 * 5 Dates
		 * 6 Title
		 * 7 Professor
		 * 8 Day + Times + Building + Room + Type
		 * 9 Campus
		 * 10 Additional Info
		 * 11 Credit Hours
		 * Max
		 * MaxResv
		 * LeftResv
		 * Enr
		 * Array?
		 * Room Cap
		 */
		//String to be written at the end
		String formattedString = "";
		
		//String used for sorting the meeting days
		String meetingRowString = "";
		
		//List and TreeMap are used for sorting the meeting days
		List<TreeMap<Integer, String>> sortedMeetings = new ArrayList<TreeMap<Integer,String>>(MAX_DAY_OF_WEEK);
		
		//initialize the TreeMaps in the ArrayList
		for(int i = 0; i < MAX_DAY_OF_WEEK; i++)
		{
			sortedMeetings.add(new TreeMap<Integer, String>());
		}

		String[] line = readLine.split(",");
		if(line.length == 0)
		{
			System.err.println("This line has no information");
			return "";
		}

		//Parse the Day + Times + Building + Room + Type 
		/*
		 * 0 Day
		 * 1 Start Time
		 * 2 End Time
		 * 3 Building
		 * 4 Room Number
		 * 5 Type
		 * Possible Repeat
		 */

		//Start the string with a '{'
		formattedString = "{\n";
		//Add the Subject to the String
		formattedString += "\"Subj\" : \"" + line[1] + "\",\n";

		//Add the Course to the String
		formattedString += "\"Crse\" : \"" + line[2] + "\",\n";

		//Add the Section to the String
		formattedString += "\"Sect\" : \"" + line[3].trim() + "\",\n";

		//Add the Meetings to the String
		formattedString += "\"Meetings\" : [\n  ";

		String dayAndTimeSuperString[] = line[8].split("`");

		for(int j = 0; j < dayAndTimeSuperString.length; j++)
		{
			String dayAndTimeString[] = dayAndTimeSuperString[j].split("[ ]{1,}");

			/*
			 * Add Type, Days, Time,
			 */
			//Break down the days and times and stores them 
			//If Days are grouped together, I.E. MW then separate them into M and W.
			//the counter is the number of spaces left to finish out empty time slots
			if(dayAndTimeString.length == 6)
			{
				String dayString[] = dayAndTimeString[0].split("");

				//Now loop through the dayString and create days and times for each day.
				for(int i = 0; i < dayString.length; i++)
				{
					int intDay = 0;
					meetingRowString = "";
					
					//Turn days into integers
					//M - 0
					//T - 1
					//W - 2
					//R - 3
					//F - 4
					//S - 5
					switch(dayString[i])
					{
						case "M" : intDay = 0;
						break;
						case "T" : intDay = 1;
						break;
						case "W" : intDay = 2;
						break;
						case "R" : intDay = 3;
						break;
						case "F" : intDay = 4;
						break;
						case "S" : intDay = 5;
						break;
					}
					
					//Add the Type to the String
					meetingRowString += "\t{\"Type\" : \"" + dayAndTimeString[5] + "\",";

					//Add the Days to the String
					meetingRowString += "\"Day\" : " + intDay + ",";

					//Add the Start Time to the String
					meetingRowString += "\"StartTime\" : " + Integer.parseInt(dayAndTimeString[1]) + ",";

					//Add the End Time to the String
					meetingRowString += "\"EndTime\" : " +  Integer.parseInt(dayAndTimeString[2]) + ",";

					//Add the Building and Room to the String but remove the trailing ','
					meetingRowString += "\"BuildingRoom\" : \"" + dayAndTimeString[3] + " " + dayAndTimeString[4] + "\"}";
	
					//add the meetingRowString to the sortedMeetings TreeMap to be sorted in time order
					sortedMeetings.get(intDay).put(Integer.parseInt(dayAndTimeString[1]), meetingRowString);
				}

			}
			else if(dayAndTimeString.length == 4)
			{
				String dayString[] = dayAndTimeString[0].split("");

				//Now loop through the dayString and create days and times for each day.
				for(int i = 0; i < dayString.length; i++)
				{
					int intDay = 0;
					meetingRowString = "";
					
					//Turn days into integers
					//M - 0
					//T - 1
					//W - 2
					//R - 3
					//F - 4
					//S - 5
					switch(dayString[i])
					{
						case "M" : intDay = 0;
						break;
						case "T" : intDay = 1;
						break;
						case "W" : intDay = 2;
						break;
						case "R" : intDay = 3;
						break;
						case "F" : intDay = 4;
						break;
						case "S" : intDay = 5;
						break;
					}
					//Add the Type to the String
					meetingRowString += "\t{\"Type\" : \"" + dayAndTimeString[3] + "\",";

					//Add the Days to the String
					meetingRowString += "\"Day\" : " + intDay + ",";

					//Add the Start Time to the String
					meetingRowString += "\"StartTime\" : " + Integer.parseInt(dayAndTimeString[1]) + ",";

					//Add the End Time to the String but remove the ',' at the end
					meetingRowString += "\"EndTime\" : " +  Integer.parseInt(dayAndTimeString[2]) + "}";

					
					//add the meetingRowString to the sortedMeetings TreeMap to be sorted in time order
					sortedMeetings.get(intDay).put(Integer.parseInt(dayAndTimeString[1]), meetingRowString);
				}
			}

			else if(dayAndTimeString.length == 3)
			{
				String dayString[] = dayAndTimeString[0].split("");

				//Now loop through the dayString and create days and times for each day.
				for(int i = 0; i < dayString.length; i++)
				{
					int intDay = 0;
					meetingRowString = "";
					
					//Turn days into integers
					//M - 0
					//T - 1
					//W - 2
					//R - 3
					//F - 4
					//S - 5
					switch(dayString[i])
					{
						case "M" : intDay = 0;
						break;
						case "T" : intDay = 1;
						break;
						case "W" : intDay = 2;
						break;
						case "R" : intDay = 3;
						break;
						case "F" : intDay = 4;
						break;
						case "S" : intDay = 5;
						break;
					}
					//Add the Days to the String
					meetingRowString += "\t{\"Day\" : " + intDay + ",";

					//Add the Building and Room to the String but remove the trailing ','
					meetingRowString += "\"BuildingRoom\" : \"" + dayAndTimeString[1] + " " + dayAndTimeString[2] + "\"}";
					
					//This type of scenario does not offer times for the classes. We use a 0 as a flag value.
					sortedMeetings.get(intDay).put(0, meetingRowString);
				}
			}
		}
		
		for(int i = 0; i < sortedMeetings.size(); i++)
		{
			Iterator<Integer> itty = sortedMeetings.get(i).keySet().iterator();
			while(itty.hasNext())
			{
				formattedString += sortedMeetings.get(i).get(itty.next()) + ",\n";
			}
		}
		
		//Remove the extra comma added above
		formattedString = formattedString.substring(0,formattedString.length() - 2);
		
		//Finish off Meetings with a ']'
		formattedString += "\n],\n";

		//Add the Session to the String
		formattedString += "\"Session\" : \"" + line[5] + "\",\n";

		//Add the CRN to the String
		formattedString += "\"CRN\" : " + line[0] + ",\n";

		//Add the Title to the String
		formattedString += "\"Title\" : \"" + line[6] + "\",\n";

		//Add the Professor to the String
		formattedString += "\"Prof\" : \"" + line[7].replaceAll("[ ]{2,}", " ") + "\",\n";

		//Add the Campus to the String
		formattedString += "\"Campus\" : \"" + line[9] + "\",\n";

		//Add the Credit Hours to the String
		formattedString += "\"Hrs\" : " + line[11] + "\n";

		//End the string with a '}'
		formattedString += "}\n";


		writer.write(formattedString);
		writer.flush();
		return formattedString;
	}

}

