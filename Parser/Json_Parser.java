package parser;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

/**
 * NOTE* Before Feeding in the CSV file you must make sure there are NO new line characters within a cell and no commas within a cell.
 * NOTE* When you remove the new line characters replace them with a '`'
 *
 */
public class Json_Parser 
{
	static BufferedReader reader;
	static BufferedWriter writer;

	public static void main(String[] args) throws IOException
	{
		reader = new BufferedReader(new FileReader("Section_Tally_RAW.csv"));
		writer = new BufferedWriter(new FileWriter("Section_Tally_FORMAT.json"));

		//Discard the header line in the CSV file.
		reader.readLine();

		while(reader.ready())
		{
			formatLine(reader.readLine());
		}


	}

	private static void formatLine(String readLine) throws IOException 
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
		String formatedString = "";

		String[] line = readLine.split(",");
		if(line.length == 0)
		{
			System.err.println("This line has no information");
			return;
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
		formatedString = "{\n";
		//Add the Subject to the String
		formatedString += "\"Subj\" : \"" + line[1] + "\",\n";

		//Add the Course to the String
		formatedString += "\"Crse\" : \"" + line[2] + "\",\n";

		//Add the Section to the String
		formatedString += "\"Sect\" : \"" + line[3].trim() + "\",\n";

		//Add the Meetings to the String
		formatedString += "\"Meetings\" : [\n";

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
					//Add the Type to the String
					formatedString += "\t{\"Type\" : \"" + dayAndTimeString[5] + "\",";

					//Add the Days to the String
					formatedString += "\"Day\" : \"" + dayString[i] + "\",";

					//Add the Start Time to the String
					formatedString += "\"StartTime\" : " + Integer.parseInt(dayAndTimeString[1]) + ",";

					//Add the End Time to the String
					formatedString += "\"EndTime\" : " +  Integer.parseInt(dayAndTimeString[2]) + ",";

					if(i == dayString.length - 1 && j == dayAndTimeSuperString.length - 1 )
					{
						//Add the Building and Room to the String but remove the trailing ','
						formatedString += "\"BuildingRoom\" : \"" + dayAndTimeString[3] + " " + dayAndTimeString[4] + "\"}\n";
					}
					else
					{
						//Add the Building and Room to the String
						formatedString += "\"BuildingRoom\" : \"" + dayAndTimeString[3] + " " + dayAndTimeString[4] + "\"},\n";
					}
				}

			}
			else if(dayAndTimeString.length == 4)
			{
				String dayString[] = dayAndTimeString[0].split("");

				//Now loop through the dayString and create days and times for each day.
				for(int i = 0; i < dayString.length; i++)
				{
					//Add the Type to the String
					formatedString += "\t{\"Type\" : \"" + dayAndTimeString[3] + "\",";

					//Add the Days to the String
					formatedString += "\"Day\" : \"" + dayString[i] + "\",";

					//Add the Start Time to the String
					formatedString += "\"StartTime\" : " + Integer.parseInt(dayAndTimeString[1]) + ",";

					if(i == dayString.length - 1 && j == dayAndTimeSuperString.length - 1)
					{
						//Add the End Time to the String but remove the ',' at the end
						formatedString += "\"EndTime\" : " +  Integer.parseInt(dayAndTimeString[2]) + "}\n";
					}
					else
					{
						//Add the End Time to the String
						formatedString += "\"EndTime\" : " +  Integer.parseInt(dayAndTimeString[2]) + "},\n";
					}
				}
			}

			else if(dayAndTimeString.length == 3)
			{
				String dayString[] = dayAndTimeString[0].split("");

				//Now loop through the dayString and create days and times for each day.
				for(int i = 0; i < dayString.length; i++)
				{
					//Add the Days to the String
					formatedString += "\t{\"Day\" : \"" + dayString[i] + "\",";

					if(i == dayString.length - 1 && j == dayAndTimeSuperString.length - 1 )
					{
						//Add the Building and Room to the String but remove the trailing ','
						formatedString += "\"BuildingRoom\" : \"" + dayAndTimeString[1] + " " + dayAndTimeString[2] + "\"}\n";
					}
					else
					{
						//Add the Building and Room to the String
						formatedString += "\"BuildingRoom\" : \"" + dayAndTimeString[1] + " " + dayAndTimeString[2] + "\"},\n";
					}
				}
			}
		}

		//Finish off Meetings with a ']'
		formatedString += "],\n";

		//Add the Session to the String
		formatedString += "\"Session\" : \"" + line[5] + "\",\n";

		//Add the CRN to the String
		formatedString += "\"CRN\" : " + line[0] + ",\n";

		//Add the Title to the String
		formatedString += "\"Title\" : \"" + line[6] + "\",\n";

		//Add the Professor to the String
		formatedString += "\"Prof\" : \"" + line[7].replaceAll("[ ]{2,}", " ") + "\",\n";

		//Add the Campus to the String
		formatedString += "\"Campus\" : \"" + line[9] + "\",\n";

		//Add the Credit Hours to the String
		formatedString += "\"Hrs\" : " + line[11] + "\n";

		//End the string with a '}'
		formatedString += "}\n";


		writer.write(formatedString);
		writer.flush();
	}
}

