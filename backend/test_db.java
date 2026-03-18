import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class test_db {
    public static void main(String[] args) {
        String urlPooler = "jdbc:postgresql://aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require";
        String urlDirect = "jdbc:postgresql://db.txzizhsuegaxkmibmstj.supabase.co:5432/postgres?sslmode=require";
        
        System.out.println("Testing Pooler URL...");
        try {
            Connection conn = DriverManager.getConnection(urlPooler, "postgres.txzizhsuegaxkmibmstj", "EZ4Zfle1MASuaIMk");
            System.out.println("Pooler SUCCESS!");
            conn.close();
            return;
        } catch (SQLException e) {
            System.out.println("Pooler FAILED: " + e.getMessage());
        }

        System.out.println("Testing Direct URL...");
        try {
            Connection conn = DriverManager.getConnection(urlDirect, "postgres", "EZ4Zfle1MASuaIMk");
            System.out.println("Direct SUCCESS!");
            conn.close();
        } catch (SQLException e) {
            System.out.println("Direct FAILED: " + e.getMessage());
        }
    }
}
